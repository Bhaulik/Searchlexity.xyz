import React, { useState } from 'react';
import { Message } from './components/chat/message';
import { ChatInput } from './components/chat/chat-input';
import { Sidebar } from './components/sidebar';
import { DiscoverPage } from './components/discover/discover-page';
import { NewThreadDialog } from './components/new-thread-dialog';
import { useSearchStore } from './store/search-store';
import OpenAI from 'openai';
import { motion, AnimatePresence } from "framer-motion";
import { Globe } from 'lucide-react';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { getRecentThreads, updateRecentThread } from './lib/utils';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

type Page = 'home' | 'discover' | 'spaces' | 'library';

function App() {
  const { messages = [], isLoading, addMessage, updateLastMessage, setLoading } = useSearchStore(state => ({
    messages: state.messages,
    isLoading: state.isLoading,
    addMessage: state.addMessage,
    updateLastMessage: state.updateLastMessage,
    setLoading: state.setLoading
  }));
  const [lastQuery, setLastQuery] = useState('');
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isNewThreadOpen, setIsNewThreadOpen] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);

  const handleStop = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setLoading(false);
    }
  };

  const handleSubmit = async (content: string) => {
    // Abort any existing request
    if (abortController) {
      abortController.abort();
    }

    // Create new abort controller
    const controller = new AbortController();
    setAbortController(controller);
    
    setLastQuery(content);
    setLoading(true);
    
    // Save initial message if this is a new thread
    if (messages.length === 0) {
      addMessage({ 
        type: 'user', 
        content
      });
    } else {
      // For follow-up questions, add to existing thread
      addMessage({ 
        type: 'user', 
        content
      });
    }
    
    try {
      // Add empty assistant message immediately
      addMessage({
        type: 'assistant',
        content: '',
        sources: [],
        related: []
      });

      // Start both streams in parallel
      const [mainStream, relatedStream] = await Promise.all([
        openai.chat.completions.create({
          messages: [
            { role: 'system', content: "You are a helpful assistant that provides clear and concise answers." },
            ...messages.map(msg => ({
              role: msg.type === 'user' ? 'user' : 'assistant',
              content: msg.content
            })) as ChatCompletionMessageParam[],
            { role: 'user', content }
          ],
          model: "gpt-4o-mini",
          stream: true,
        }, {
          signal: controller.signal
        }),
        openai.chat.completions.create({
          messages: [
            { 
              role: 'system', 
              content: "Generate 5 relevant follow-up questions based on the conversation. Respond with JSON." 
            },
            ...messages.map(msg => ({
              role: msg.type === 'user' ? 'user' : 'assistant',
              content: msg.content
            })) as ChatCompletionMessageParam[],
            { role: 'user', content },
            { role: 'user', content: "Generate 5 follow-up questions about this topic. Respond with JSON." }
          ],
          model: "gpt-4o-mini",
          stream: true,
          response_format: { type: "json_object" },
          tools: [
            {
              type: "function",
              function: {
                name: "get_related_questions",
                description: "Get related follow-up questions",
                parameters: {
                  type: "object", 
                  properties: {
                    questions: {
                      type: "array",
                      description: "Array of 5 follow-up questions",
                      items: {
                        type: "string"
                      },
                      minItems: 5,
                      maxItems: 5
                    }
                  },
                  required: ["questions"]
                }
              }
            }
          ],
          tool_choice: { type: "function", function: { name: "get_related_questions" } }
        }, {
          signal: controller.signal
        })
      ]);

      let fullResponse = '';
      let relatedResponse = '';
      let lastUpdateTime = Date.now();
      const UPDATE_INTERVAL = 50; // Update UI every 50ms at most

      // Process both streams concurrently
      await Promise.all([
        // Main response stream
        (async () => {
          for await (const chunk of mainStream) {
            const content = chunk.choices[0]?.delta?.content || '';
            fullResponse += content;
            
            // Throttle updates to prevent excessive re-renders
            if (Date.now() - lastUpdateTime >= UPDATE_INTERVAL) {
              updateLastMessage({
                type: 'assistant',
                content: fullResponse,
                sources: [],
                related: []
              });
              lastUpdateTime = Date.now();
            }
          }
        })(),

        // Related questions stream - accumulate tool call response
        (async () => {
          for await (const chunk of relatedStream) {
            if (chunk.choices[0]?.delta?.tool_calls?.[0]?.function?.arguments) {
              relatedResponse += chunk.choices[0].delta.tool_calls[0].function.arguments;
            }
          }
        })()
      ]);

      // After both streams complete, parse and update with related questions
      let relatedQuestions = [
        "Tell me more about this topic",
        "What are the main benefits?",
        "Can you explain it differently?",
        "What are some examples?",
        "What are the limitations?"
      ];

      try {
        if (relatedResponse) {
          const parsedResponse = JSON.parse(relatedResponse);
          if (parsedResponse?.questions && Array.isArray(parsedResponse.questions) && parsedResponse.questions.length > 0) {
            relatedQuestions = parsedResponse.questions;
          }
        }
      } catch (e) {
        console.error('Error parsing related questions:', e);
        console.log('Raw response:', relatedResponse);
      }

      // Final update with complete content and questions
      const finalMessage = {
        type: 'assistant' as const,
        content: fullResponse,
        sources: [],
        related: relatedQuestions
      };
      
      updateLastMessage(finalMessage);

      // Get all messages including the new ones
      const allMessages = [
        ...messages, // Include all existing messages
        { type: 'user' as const, content },
        finalMessage
      ];

      // Create new thread if none exists, otherwise update existing
      if (!currentThreadId) {
        const threads = updateRecentThread(null, content, allMessages);
        setCurrentThreadId(threads[0].id);
      } else {
        updateRecentThread(currentThreadId, messages[0]?.content || content, allMessages);
      }

    } catch (error) {
      console.error('Error calling OpenAI:', error);
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

  const handlePageChange = (page: Page) => {
    setCurrentPage(page);
    if (page === 'home') {
      useSearchStore.getState().clearMessages();
    }
  };

  const handleNewThread = () => {
    setIsNewThreadOpen(true);
  };

  const handleRelatedClick = (question: string) => {
    handleSubmit(question);
  };

  return (
    <div className="flex h-screen bg-perplexity-bg text-perplexity-text">
      <div className="hidden md:block">
        <Sidebar 
          currentPage={currentPage} 
          onPageChange={handlePageChange}
          onNewThread={handleNewThread}
        />
      </div>
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {currentPage === 'discover' ? (
          <DiscoverPage />
        ) : currentPage === 'home' && messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl mx-auto space-y-8 px-4">
              <h1 className="text-[40px] md:text-[56px] leading-[1.1] font-medium text-center">
                What do you want to know?
              </h1>
              <ChatInput onSubmit={handleSubmit} disabled={isLoading} onStop={handleStop} />
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-3xl mx-auto p-4 md:p-6">
                <div className="space-y-6">
                  {messages.map((message, index) => (
                    <Message 
                      key={index} 
                      {...message} 
                      onRelatedClick={handleRelatedClick}
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
                        animate={{ 
                          rotate: 360,
                        }}
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

      <NewThreadDialog 
        isOpen={isNewThreadOpen}
        onClose={() => setIsNewThreadOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export default App;