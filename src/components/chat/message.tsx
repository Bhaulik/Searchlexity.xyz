import React, { useState, useEffect, useRef } from 'react';
import { Share, RotateCcw, Copy, MoreHorizontal, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type MessageType = 'user' | 'assistant';

interface MessageProps {
  content: string;
  type: MessageType;
  sources?: Array<{
    id: string;
    title: string;
    url: string;
    snippet: string;
    author?: string;
  }>;
  related?: string[];
  onRelatedClick?: (question: string) => void;
}

export function Message({ content, type, sources = [], related = [], onRelatedClick }: MessageProps) {
  const messageRef = useRef<HTMLDivElement>(null);
  const [isFromRelated, setIsFromRelated] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

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

  return (
    <div 
      ref={messageRef}
      className={cn(
        "px-6 py-4",
        type === 'user' ? '' : 'bg-transparent'
      )}
    >
      {type === 'user' ? (
        <h2 className="text-[40px] leading-[1.2] font-normal text-perplexity-text tracking-[-0.01em]">{content}</h2>
      ) : (
        <div className="space-y-4">
          {sources.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-perplexity-muted">
                  <path d="M8 1.5V3M8 13V14.5M14.5 8H13M3 8H1.5M12.5 12.5L11.5 11.5M4.5 4.5L3.5 3.5M12.5 3.5L11.5 4.5M4.5 11.5L3.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span className="text-[15px] font-medium tracking-[-0.01em] text-perplexity-text">Sources</span>
              </div>
              <div className="grid gap-2">
                {sources.map((source) => (
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
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[15px] font-medium text-perplexity-accent truncate">{source.title}</span>
                        <span className="text-xs text-perplexity-muted truncate">{new URL(source.url).hostname}</span>
                      </div>
                      <p className="text-sm text-perplexity-muted line-clamp-2">{source.snippet}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <div className="w-6 h-6">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="text-perplexity-text">
                <path fill="currentColor" d="M12 2L1 12h3v9h7v-6h2v6h7v-9h3L12 2z"/>
              </svg>
            </div>
            <span className="font-medium text-lg tracking-[-0.01em]">Perplexity</span>
          </div>

          <div className="prose dark:prose-invert prose-helvetica max-w-none text-[17px]">
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
                  return (
                    <code 
                      className={cn(
                        "text-[15px] font-normal",
                        inline 
                          ? "bg-perplexity-card px-1.5 py-0.5 rounded text-perplexity-accent" 
                          : "block bg-perplexity-card p-4 rounded-lg",
                        className
                      )}
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                p: ({ node, ...props }) => (
                  <p 
                    {...props} 
                    className="text-[17px] font-normal leading-[1.6] tracking-[-0.01em] mb-3" 
                  />
                ),
                ul: ({ node, ...props }) => (
                  <ul {...props} className="list-disc pl-4 space-y-1 text-[17px] mb-3" />
                ),
                h2: ({ node, ...props }) => (
                  <h2 {...props} className="text-[19px] font-medium tracking-[-0.01em] mb-2 mt-6 first:mt-0" />
                ),
                h3: ({ node, ...props }) => (
                  <h3 {...props} className="text-[17px] font-medium tracking-[-0.01em] mb-1 mt-4" />
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>

          <div className="flex items-center gap-4 text-perplexity-muted mt-2">
            <button className="flex items-center gap-2 hover:text-perplexity-text transition-colors">
              <Share className="w-4 h-4" />
              <span className="text-sm">Share</span>
            </button>
            <button className="flex items-center gap-2 hover:text-perplexity-text transition-colors">
              <RotateCcw className="w-4 h-4" />
              <span className="text-sm">Rewrite</span>
            </button>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleCopy}
                className="hover:text-perplexity-text transition-colors"
                title={isCopied ? "Copied!" : "Copy to clipboard"}
              >
                <Copy className="w-4 h-4" />
              </button>
              <button className="hover:text-perplexity-text transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {related.length > 0 && (
            <div className="-mx-6 mt-6">
              <div className="flex items-center gap-2 px-6 py-3 border-t border-perplexity-card">
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
                      className="flex w-full text-left px-6 py-3 hover:bg-perplexity-card/50 transition-colors group justify-between items-center"
                    >
                      <span className="text-[17px] text-perplexity-muted group-hover:text-perplexity-accent transition-colors font-normal tracking-[-0.01em]">{question}</span>
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