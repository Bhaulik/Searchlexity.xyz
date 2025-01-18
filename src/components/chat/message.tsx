import React, { useState, useEffect, useRef } from 'react';
import { Share, RotateCcw, Copy, MoreHorizontal, Plus, Loader2, StopCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Message as MessageType, Source } from '../../types/message';
import { openai, DEFAULT_MODEL } from '../../config/api-config';

interface MessageProps {
  content: string;
  type: 'user' | 'assistant';
  sources?: Source[];
  related?: string[];
  steps?: Array<{
    id: number;
    description: string;
    requires_search: boolean;
    requires_tools: string[];
    status?: 'pending' | 'loading' | 'complete';
  }>;
  onRelatedClick?: (question: string) => void;
  isLoading?: boolean;
  onStop?: () => void;
  isAgentMode?: boolean;
}

function isValidUrl(urlString: string): boolean {
  try {
    new URL(urlString);
    return true;
  } catch (e) {
    return false;
  }
}

export function Message({ 
  content, 
  type, 
  sources = [], 
  related = [], 
  steps = [],
  onRelatedClick,
  isLoading,
  onStop,
  isAgentMode
}: MessageProps) {
  const messageRef = useRef<HTMLDivElement>(null);
  const [isFromRelated, setIsFromRelated] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [isShared, setIsShared] = useState(false);

  useEffect(() => {
    if (messageRef.current) {
      const parentContainer = messageRef.current.closest('.overflow-y-auto');
      if (parentContainer) {
        const messageTop = messageRef.current.offsetTop;
        const containerHeight = parentContainer.clientHeight;
        const scrollPosition = isFromRelated 
          ? messageTop - (containerHeight / 3)
          : messageTop - 100;
        
        parentContainer.scrollTo({
          top: scrollPosition,
          behavior: 'smooth'
        });
      }
    }
  }, [content, isFromRelated]);

  const handleRelatedClick = (question: string) => {
    setIsFromRelated(true);
    onRelatedClick?.(question);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  // Filter and validate sources before rendering
  const validSources = sources.filter(source => source.url && isValidUrl(source.url));

  const handleRewrite = async () => {
    const isAssistantMessage = type === 'assistant' as const;
    if (!isRewriting && isAssistantMessage) {
      setIsRewriting(true);
      try {
        // First, get the original question from the previous message
        const messageElement = messageRef.current?.previousElementSibling;
        const questionElement = messageElement?.querySelector('h2');
        const originalQuestion = questionElement?.textContent || '';

        if (!originalQuestion) {
          console.error('Could not find original question');
          return;
        }

        // Step 1: Improve the prompt using LLM
        const improvePromptResponse = await openai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'You are an expert at improving questions and prompts to get better, more accurate answers. Your goal is to make questions more specific, detailed, and focused while maintaining the original intent. Add relevant context and clarify any ambiguities.'
            },
            {
              role: 'user',
              content: `Please improve this question to get a better answer. Make it more specific and detailed while maintaining the original intent: "${originalQuestion}"`
            }
          ],
          model: DEFAULT_MODEL,
          temperature: 0.7,
        });
        
        const improvedPrompt = improvePromptResponse.choices[0]?.message?.content;
        if (improvedPrompt) {
          // Step 2: Use the improved prompt to get a new answer
          onRelatedClick?.(improvedPrompt);
        }
      } catch (err) {
        console.error('Failed to rewrite prompt:', err);
      } finally {
        setIsRewriting(false);
      }
    }
  };

  const handleShare = async () => {
    try {
      // Get all messages in the thread
      const chatContainer = messageRef.current?.closest('.overflow-y-auto');
      if (!chatContainer) return;

      const messages = chatContainer.querySelectorAll('[data-message]');
      let shareText = "Conversation Thread:\n\n";

      messages.forEach((msg) => {
        const type = msg.getAttribute('data-message-type');
        const content = msg.querySelector('h2, .prose')?.textContent || '';
        
        if (type === 'user') {
          shareText += `Q: ${content}\n\n`;
        } else {
          shareText += `A: ${content}\n\n`;
        }
      });

      await navigator.clipboard.writeText(shareText);
      setIsShared(true);
      setTimeout(() => setIsShared(false), 2000);
    } catch (err) {
      console.error('Failed to share conversation:', err);
    }
  };

  return (
    <div 
      ref={messageRef}
      data-message
      data-message-type={type}
      className={cn(
        "px-4 md:px-6 py-4",
        type === 'user' ? '' : 'bg-transparent'
      )}
    >
      {type === 'user' ? (
        <h2 className="text-[32px] md:text-[40px] leading-[1.2] font-normal text-perplexity-text tracking-[-0.01em]">{content}</h2>
      ) : (
        <div className="space-y-4">
          {/* Agent Steps */}
          {isAgentMode && steps.length > 0 && (
            <div className="mb-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-perplexity-accent">
                    <path d="M8 1.5V3M8 13V14.5M14.5 8H13M3 8H1.5M12.5 12.5L11.5 11.5M4.5 4.5L3.5 3.5M12.5 3.5L11.5 4.5M4.5 11.5L3.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span className="text-[15px] font-medium tracking-[-0.01em] text-perplexity-text">Agent Progress</span>
                </div>
                {isLoading && onStop && (
                  <button 
                    onClick={onStop}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-perplexity-card/50 hover:bg-perplexity-card text-perplexity-muted hover:text-perplexity-text transition-colors"
                  >
                    <StopCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Stop</span>
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {steps.map((step) => (
                  <div 
                    key={step.id}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-lg",
                      step.status === 'loading' ? "bg-perplexity-card/50" : "bg-transparent"
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 flex items-center justify-center rounded-full text-sm font-medium",
                      step.status === 'complete' ? "bg-perplexity-accent/10 text-perplexity-accent" :
                      step.status === 'loading' ? "bg-perplexity-card" :
                      "bg-perplexity-card/30 text-perplexity-muted"
                    )}>
                      {step.status === 'loading' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        step.id
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={cn(
                        "font-medium",
                        step.status === 'complete' ? "text-perplexity-accent" :
                        step.status === 'loading' ? "text-perplexity-text" :
                        "text-perplexity-muted"
                      )}>
                        {step.description}
                      </div>
                      {(step.requires_search || step.requires_tools.length > 0) && step.status === 'loading' && (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {step.requires_search && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-perplexity-card text-perplexity-muted">
                              Searching...
                            </span>
                          )}
                          {step.requires_tools.map((tool) => (
                            <span 
                              key={tool}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-perplexity-card text-perplexity-muted"
                            >
                              Using {tool}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sources */}
          {validSources.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-perplexity-muted">
                  <path d="M8 1.5V3M8 13V14.5M14.5 8H13M3 8H1.5M12.5 12.5L11.5 11.5M4.5 4.5L3.5 3.5M12.5 3.5L11.5 4.5M4.5 11.5L3.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span className="text-[15px] font-medium tracking-[-0.01em] text-perplexity-text">Sources</span>
              </div>
              <div className="md:grid md:gap-2 -mx-4 md:mx-0">
                <div className="flex md:hidden overflow-x-auto px-4 gap-3 pb-2 scrollbar-none">
                  {validSources.map((source) => (
                    <a
                      key={source.id}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 w-[280px] flex items-start gap-2 p-2 rounded-xl bg-perplexity-card/50 hover:bg-perplexity-card transition-colors"
                    >
                      <div className="w-5 h-5 mt-0.5 flex-shrink-0">
                        <img src={`https://www.google.com/s2/favicons?domain=${source.url}&sz=128`} className="w-full h-full rounded" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-0.5 mb-1">
                          <span className="text-sm font-medium text-perplexity-accent truncate">{source.title}</span>
                          <span className="text-xs text-perplexity-muted truncate">{new URL(source.url).hostname}</span>
                        </div>
                        <p className="text-xs text-perplexity-muted line-clamp-2">{source.snippet}</p>
                      </div>
                    </a>
                  ))}
                </div>
                <div className="hidden md:grid gap-2">
                  {validSources.map((source) => (
                    <a
                      key={source.id}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 p-3 rounded-xl bg-perplexity-card/50 hover:bg-perplexity-card transition-colors"
                    >
                      <div className="w-6 h-6 mt-0.5 flex-shrink-0">
                        <img src={`https://www.google.com/s2/favicons?domain=${source.url}&sz=128`} className="w-full h-full rounded" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-1 mb-1">
                          <span className="text-[15px] font-medium text-perplexity-accent truncate">{source.title}</span>
                          <span className="text-xs text-perplexity-muted truncate">{new URL(source.url).hostname}</span>
                        </div>
                        <p className="text-sm text-perplexity-muted line-clamp-2">{source.snippet}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Answer */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="text-perplexity-accent">
                <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </div>
            <span className="font-medium text-lg tracking-[-0.01em]">Answer</span>
          </div>

          <div className="prose dark:prose-invert prose-helvetica max-w-none text-[15px] md:text-[17px]">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ node, ...props }) => (
                  <a 
                    {...props} 
                    className="text-perplexity-accent hover:underline font-normal" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  />
                ),
                code: ({ node, inline, className, children, ...props }: any) => {
                  const match = /language-(\w+)/.exec(className || '');
                  const codeText = Array.isArray(children) ? children.join('') : children;
                  
                  if (inline) {
                    return (
                      <code 
                        className="bg-perplexity-card px-1.5 py-0.5 rounded text-perplexity-accent text-[14px] md:text-[15px] font-normal"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  }

                  const handleCopyCode = async () => {
                    try {
                      await navigator.clipboard.writeText(codeText);
                      const button = document.activeElement as HTMLButtonElement;
                      if (button) {
                        button.innerText = "Copied!";
                        setTimeout(() => {
                          button.innerText = "Copy";
                        }, 2000);
                      }
                    } catch (err) {
                      console.error('Failed to copy code:', err);
                    }
                  };

                  return (
                    <div className="relative group">
                      <button
                        onClick={handleCopyCode}
                        className="absolute right-2 top-2 px-2 py-1 text-xs font-medium bg-perplexity-card/50 hover:bg-perplexity-card text-perplexity-muted hover:text-perplexity-text rounded transition-colors opacity-0 group-hover:opacity-100"
                      >
                        Copy
                      </button>
                      <code 
                        className={cn(
                          "text-[14px] md:text-[15px] font-normal block bg-perplexity-card p-4 rounded-lg overflow-x-auto",
                          className
                        )}
                        {...props}
                      >
                        {children}
                      </code>
                    </div>
                  );
                },
                p: ({ node, ...props }) => (
                  <p 
                    {...props} 
                    className="text-[15px] md:text-[17px] font-normal leading-[1.6] tracking-[-0.01em] mb-3" 
                  />
                ),
                ul: ({ node, ...props }) => (
                  <ul {...props} className="list-disc pl-4 space-y-1 text-[15px] md:text-[17px] mb-3" />
                ),
                h2: ({ node, ...props }) => (
                  <h2 {...props} className="text-[17px] md:text-[19px] font-medium tracking-[-0.01em] mb-2 mt-6 first:mt-0" />
                ),
                h3: ({ node, ...props }) => (
                  <h3 {...props} className="text-[15px] md:text-[17px] font-medium tracking-[-0.01em] mb-1 mt-4" />
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-4 text-perplexity-muted mt-2">
            <button 
              onClick={handleShare}
              className="flex items-center gap-2 hover:text-perplexity-text transition-colors"
            >
              <Share className="w-4 h-4" />
              <span className="text-sm">{isShared ? "Copied!" : "Share"}</span>
            </button>
            {(type as MessageProps['type']) === 'assistant' && (
              <button 
                onClick={handleRewrite}
                disabled={isRewriting}
                className={cn(
                  "flex items-center gap-2 transition-colors",
                  isRewriting ? "text-perplexity-muted" : "hover:text-perplexity-text"
                )}
              >
                <RotateCcw className={cn("w-4 h-4", isRewriting && "animate-spin")} />
                <span className="text-sm">{isRewriting ? "Rewriting..." : "Rewrite"}</span>
              </button>
            )}
            <button 
              onClick={handleCopy}
              className="flex items-center gap-2 hover:text-perplexity-text transition-colors"
              title={isCopied ? "Copied!" : "Copy to clipboard"}
            >
              <Copy className="w-4 h-4" />
              <span className="text-sm">{isCopied ? "Copied!" : "Copy"}</span>
            </button>
            <button className="hover:text-perplexity-text transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Related Questions - Only show when message is complete */}
          {related.length > 0 && !isLoading && (
            <div className="-mx-4 md:-mx-6 mt-6">
              <div className="flex items-center gap-2 px-4 md:px-6 py-3 border-t border-perplexity-card">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-perplexity-muted">
                  <path d="M2 3.5H14M2 8H14M2 12.5H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span className="text-[15px] font-medium tracking-[-0.01em] text-perplexity-muted">Related</span>
              </div>
              <div>
                {related.map((question, index) => (
                  <div key={index} className="border-t border-perplexity-card/50">
                    <button
                      onClick={() => handleRelatedClick(question)}
                      className="flex w-full text-left px-4 md:px-6 py-3 hover:bg-perplexity-card/50 transition-colors group justify-between items-center"
                    >
                      <span className="text-[15px] md:text-[17px] text-perplexity-muted group-hover:text-perplexity-accent transition-colors font-normal tracking-[-0.01em]">{question}</span>
                      <Plus className="w-4 h-4 text-perplexity-muted group-hover:text-perplexity-accent transition-colors flex-shrink-0" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}