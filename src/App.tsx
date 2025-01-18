import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { Globe, Sparkles } from 'lucide-react';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { cn } from './lib/utils';
import type { Message, Source, AgentStep } from './types/message';
import mixpanel from 'mixpanel-browser';
import { ENABLE_ANALYTICS } from './config/api-config';
import { SYSTEM_PROMPTS } from './config/prompts';

// Components
import { Message as MessageComponent } from './components/chat/message';
import { ChatInput } from './components/chat/chat-input';
import { Sidebar } from './components/sidebar';
import { DiscoverPage } from './components/discover/discover-page';
import { NewThreadDialog } from './components/new-thread-dialog';

// Store and utilities
import { useSearchStore } from './store/search-store';
import { getRecentThreads, updateRecentThread } from './lib/utils';

// Services and configuration
import { UPDATE_INTERVAL } from './config/api-config';
import { TOOLS } from './services/tool-service';
import { 
  searchWeb, 
  formatSearchContext,
  createChatCompletion,
  createMainChatMessages,
  createRelatedQuestionsMessages
} from './services/llm-service';
import type { SearchSource } from './services/tool-service';

// Agents
import { AgentOrchestrator } from './agents/agent-orchestrator';

type Page = 'home' | 'discover';

interface AppState {
  lastQuery: string;
  currentPage: Page;
  isNewThreadOpen: boolean;
  currentThreadId: string | null;
  abortController: AbortController | null;
}

/**
 * Main application component that handles chat functionality and navigation
 */
function App() {
  // Get store state and actions
  const { 
    messages = [], 
    isLoading,
    isProMode,
    selectedLanguage,
    addMessage, 
    updateLastMessage, 
    setLoading,
    toggleProMode
  } = useSearchStore(state => ({
    messages: state.messages,
    isLoading: state.isLoading,
    isProMode: state.isProMode,
    selectedLanguage: state.selectedLanguage,
    addMessage: state.addMessage,
    updateLastMessage: state.updateLastMessage,
    setLoading: state.setLoading,
    toggleProMode: state.toggleProMode
  }));

  // Local state
  const [state, setState] = useState<AppState>({
    lastQuery: '',
    currentPage: 'home',
    isNewThreadOpen: false,
    currentThreadId: null,
    abortController: null
  });

  // Initialize agent orchestrator
  const agentOrchestrator = AgentOrchestrator.getInstance();

  /**
   * Stops any ongoing API requests
   */
  const handleStop = () => {
    if (state.abortController) {
      state.abortController.abort();
      setState(prev => ({ ...prev, abortController: null }));
      setLoading(false);
    }
  };

  /**
   * Handles submission of new messages and manages the chat flow
   * @param content - The message content from the user
   */
  const handleSubmit = async (content: string, language: string) => {
    if (ENABLE_ANALYTICS) {
      mixpanel.track('Message Sent', {
        message_length: content.length,
        has_previous_messages: messages.length > 0,
        language: language,
        timestamp: new Date().toISOString()
      });
    }

    // Abort any existing request
    if (state.abortController) {
      state.abortController.abort();
    }

    // Create new abort controller
    const controller = new AbortController();
    setState(prev => ({ 
      ...prev, 
      lastQuery: content,
      abortController: controller 
    }));
    
    setLoading(true);
    
    // Add user message to the chat
    addMessage({ 
      type: 'user', 
      content,
      sources: [],
      related: [],
      steps: []
    });
    
    try {
      if (isProMode) {
        // Add initial message with loading step
        const initialMessage = {
          type: 'assistant' as const,
          content: '',
          sources: [],
          related: [],
          steps: [{
            id: 1,
            description: `Planning response in ${language}`,
            requires_search: false,
            requires_tools: [],
            status: 'loading'
          }]
        };
        addMessage(initialMessage);

        // Use agent-based processing with step updates
        const result = await agentOrchestrator.process(
          content,
          messages.map(msg => ({
            role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
            content: msg.content
          })),
          (updatedSteps) => {
            updateLastMessage({
              type: 'assistant',
              content: '',
              sources: [],
              related: [],
              steps: updatedSteps
            });
          },
          language
        );

        // Generate related questions
        const relatedQuestionsResponse = await createChatCompletion(
          [
            { 
              role: 'system', 
              content: SYSTEM_PROMPTS.RELATED_QUESTIONS(language)
            },
            { 
              role: 'user', 
              content: `Generate 5 related questions for this topic and response:\n\nTopic: ${content}\n\nResponse: ${result.answer}` 
            }
          ],
          {
            tools: [TOOLS.RELATED_QUESTIONS.tool],
            toolChoice: { type: "function", function: { name: TOOLS.RELATED_QUESTIONS.name } }
          }
        );

        let relatedQuestions = [
          "Tell me more about this topic",
          "What are the main benefits?",
          "Can you explain it differently?",
          "What are some examples?",
          "What are the limitations?"
        ];

        try {
          if (relatedQuestionsResponse.toolCallResponse) {
            const parsedResponse = JSON.parse(relatedQuestionsResponse.toolCallResponse);
            if (parsedResponse?.questions && Array.isArray(parsedResponse.questions)) {
              relatedQuestions = parsedResponse.questions;
            }
          }
        } catch (e) {
          console.error('Error parsing related questions:', e);
        }

        // Update the last message with the final result
        updateLastMessage({
          type: 'assistant',
          content: result.answer,
          sources: result.sources,
          related: relatedQuestions,
          steps: result.steps
        });

        // Update thread history
        const allMessages = [...messages];
        if (!state.currentThreadId) {
          const threads = updateRecentThread(null, content, allMessages);
          setState(prev => ({ ...prev, currentThreadId: threads[0].id }));
        } else {
          updateRecentThread(state.currentThreadId, messages[0]?.content || content, allMessages);
        }

      } else {
        // Add empty assistant message for streaming
        addMessage({
          type: 'assistant',
          content: '',
          sources: [],
          related: [],
          steps: []
        });

        // Use standard processing with streaming
        let searchResults = await searchWeb(content);
        let searchContext = searchResults.length > 0 ? formatSearchContext(searchResults) : '';

        // Prepare conversation history with language context
        const conversationHistory = messages.slice(0, -1).map(msg => ({
          role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.type === 'assistant' 
            ? `${msg.content}${msg.sources?.length ? '\nSources used: ' + msg.sources.map(s => s.title).join(', ') : ''}`
            : msg.content
        }));

        // Add language instruction to system message
        const systemMessage = {
          role: 'system' as const,
          content: `You are a helpful assistant. IMPORTANT: You must respond in ${language}. This is a strict requirement - all your responses should be in ${language} only. ${searchContext ? "Use the search results provided to enhance your responses, and always cite your sources when using information from them." : ""}`
        };

        // Start both streams in parallel
        let lastUpdateTime = Date.now();
        let fullResponse = '';
        let relatedQuestions = [
          "Tell me more about this topic",
          "What are the main benefits?",
          "Can you explain it differently?",
          "What are some examples?",
          "What are the limitations?"
        ];

        // Process main response and related questions in parallel
        const [mainResponse, relatedResponse] = await Promise.all([
          // Main chat completion with streaming
          createChatCompletion(
            [
              { 
                role: 'system', 
                content: `You are a helpful assistant. IMPORTANT: You must respond in ${language}. This is a strict requirement - all your responses should be in ${language} only. ${searchContext ? "Use the search results provided to enhance your responses, and always cite your sources when using information from them." : ""}`
              },
              ...conversationHistory,
              ...(searchContext ? [{
                role: 'user' as const,
                content: `Search Results:\n${searchContext}`
              }] : []),
              {
                role: 'user',
                content: messages[0]?.content
                  ? `Previous topic: ${messages[0].content}\nNew question: ${content}`
                  : content
              }
            ],
            {
              handlers: {
                onToken: (token) => {
                  fullResponse += token;
                  if (Date.now() - lastUpdateTime >= UPDATE_INTERVAL) {
                    updateLastMessage({
                      type: 'assistant',
                      content: fullResponse,
                      sources: searchResults.map(result => ({
                        id: result.url,
                        title: result.title,
                        url: result.url,
                        snippet: result.snippet
                      })),
                      related: relatedQuestions,
                      steps: [],
                      language: language
                    });
                    lastUpdateTime = Date.now();
                  }
                }
              }
            }
          ),

          // Related questions completion with stronger language instruction
          createChatCompletion(
            [
              { 
                role: 'system', 
                content: `You are a helpful assistant. IMPORTANT: You must generate all questions in ${language} only. This is a strict requirement - do not use any other language.` 
              },
              ...createRelatedQuestionsMessages(
                conversationHistory,
                content,
                messages[0]?.content,
                language
              )
            ],
            {
              tools: [TOOLS.RELATED_QUESTIONS.tool],
              toolChoice: { type: "function", function: { name: TOOLS.RELATED_QUESTIONS.name } }
            }
          )
        ]);

        // Process related questions response
        try {
          if (relatedResponse.toolCallResponse) {
            const parsedResponse = JSON.parse(relatedResponse.toolCallResponse);
            if (parsedResponse?.questions && Array.isArray(parsedResponse.questions)) {
              relatedQuestions = parsedResponse.questions;
            }
          }
        } catch (e) {
          console.error('Error parsing related questions:', e);
        }

        // Update final message with complete response
        updateLastMessage({
          type: 'assistant',
          content: fullResponse,
          sources: searchResults.map(result => ({
            id: result.url,
            title: result.title,
            url: result.url,
            snippet: result.snippet
          })),
          related: relatedQuestions,
          steps: []
        });

        // Update thread history with complete messages
        const allMessages = [
          ...messages.slice(0, -1),
          { 
            type: 'user' as const, 
            content,
            sources: [],
            related: [],
            steps: []
          },
          {
            type: 'assistant' as const,
            content: fullResponse,
            sources: searchResults.map(result => ({
              id: result.url,
              title: result.title,
              url: result.url,
              snippet: result.snippet
            })),
            related: relatedQuestions,
            steps: []
          }
        ];
        
        if (!state.currentThreadId) {
          const threads = updateRecentThread(null, content, allMessages);
          setState(prev => ({ ...prev, currentThreadId: threads[0].id }));
        } else {
          updateRecentThread(state.currentThreadId, messages[0]?.content || content, allMessages);
        }
      }

    } catch (error) {
      console.error('Error:', error);
      addMessage({
        type: 'assistant',
        content: 'I apologize, but I encountered an error while processing your request. Please try again.',
        sources: [],
        related: []
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles navigation between different pages
   */
  const handlePageChange = (page: Page) => {
    setState(prev => ({ ...prev, currentPage: page }));
    if (page === 'home') {
      const recentThreads = getRecentThreads();
      if (recentThreads.length > 0) {
        const latestThread = recentThreads[0];
        setState(prev => ({ 
          ...prev, 
          currentThreadId: latestThread.id 
        }));
        
        // Properly type and format the messages
        const typedMessages = latestThread.messages.map(msg => {
          const baseMessage = {
            ...msg,
            type: msg.type as 'user' | 'assistant',
            sources: msg.sources || [],
            related: msg.related || []
          };

          // Add steps only if it's an agent message
          if ('steps' in msg) {
            return {
              ...baseMessage,
              steps: msg.steps || []
            };
          }

          return baseMessage;
        });

        useSearchStore.getState().setMessages(typedMessages);
      } else {
        useSearchStore.getState().clearMessages();
      }
    }
  };

  /**
   * Opens the new thread dialog
   */
  const handleNewThread = () => {
    setState(prev => ({ 
      ...prev, 
      isNewThreadOpen: true,
      currentThreadId: null 
    }));
    useSearchStore.getState().clearMessages();
  };

  /**
   * Handles clicks on related questions
   * @param question - The selected related question
   */
  const handleRelatedClick = (question: string) => {
    if (ENABLE_ANALYTICS) {
      mixpanel.track('Related Question Clicked', {
        question,
        previous_message: messages[messages.length - 2]?.content,
        language: selectedLanguage,
        timestamp: new Date().toISOString()
      });
    }
    handleSubmit(question, selectedLanguage);
  };

  /**
   * Toggles Pro mode
   */
  const handleProModeToggle = () => {
    toggleProMode();
  };

  // Track page view on component mount
  useEffect(() => {
    if (ENABLE_ANALYTICS) {
      mixpanel.track('Page View', {
        page: 'chat',
        timestamp: new Date().toISOString()
      });
    }
  }, []);

  return (
    <div className="flex h-screen bg-perplexity-bg text-perplexity-text">
      {/* Sidebar */}
      <div className="hidden md:block">
        <Sidebar 
          currentPage={state.currentPage} 
          onPageChange={handlePageChange}
          onNewThread={handleNewThread}
        />
      </div>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {state.currentPage === 'discover' ? (
          <DiscoverPage />
        ) : state.currentPage === 'home' && messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-4 bg-gradient-to-b from-transparent to-perplexity-card/20">
            <div className="w-full max-w-2xl mx-auto space-y-8 px-4">
              <div className="space-y-4 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ 
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="text-perplexity-accent inline-block"
                >
                  <Globe className="w-12 h-12 mx-auto mb-6" />
                </motion.div>
                <h1 className="text-[40px] md:text-[56px] leading-[1.1] font-medium bg-gradient-to-br from-perplexity-text to-perplexity-accent bg-clip-text text-transparent">
                  What do you want to know?
                </h1>
                <p className="text-perplexity-muted text-lg">
                  Ask anything. Get instant answers.
                </p>
              </div>
              <div className="transform transition-all duration-300 hover:scale-[1.02]">
                <ChatInput 
                  onSubmit={handleSubmit} 
                  disabled={isLoading} 
                  onStop={handleStop} 
                />
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-3xl mx-auto p-4 md:p-6">
                <div className="space-y-6">
                  {messages.map((message, index) => (
                    <MessageComponent 
                      key={index} 
                      {...message} 
                      onRelatedClick={handleRelatedClick}
                      isLoading={isLoading}
                      onStop={handleStop}
                      isAgentMode={isProMode && message.type === 'assistant' && 'steps' in message}
                    />
                  ))}
                  {isLoading && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex justify-center p-4"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                        className="text-perplexity-text"
                      >
                        <Globe className="w-8 h-8" />
                      </motion.div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            {/* Chat Input */}
            <div className="sticky bottom-0 bg-perplexity-bg border-t border-perplexity-card p-4">
              <div className="max-w-3xl mx-auto">
                <ChatInput 
                  onSubmit={handleSubmit} 
                  disabled={isLoading} 
                  isFollowUp={true}
                  onStop={handleStop}
                />
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <footer className="hidden md:block border-t border-perplexity-card py-4 px-6">
          <div className="flex items-center justify-between text-sm text-perplexity-muted">
            <div className="flex gap-4">
              <a href="#" className="hover:text-perplexity-text">Pro</a>
              <a href="#" className="hover:text-perplexity-text">Enterprise</a>
              <a href="#" className="hover:text-perplexity-text">Blog</a>
            </div>
            <div className="flex gap-4">
              <a href="#" className="hover:text-perplexity-text">English</a>
              <a href="#" className="hover:text-perplexity-text">Help</a>
            </div>
          </div>
        </footer>
      </main>

      {/* New Thread Dialog */}
      <NewThreadDialog 
        isOpen={state.isNewThreadOpen}
        onClose={() => setState(prev => ({ ...prev, isNewThreadOpen: false }))}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export default App;