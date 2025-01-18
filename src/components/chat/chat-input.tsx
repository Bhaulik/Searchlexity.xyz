import React, { useState, useRef, useEffect } from 'react';
import { Focus, Paperclip, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useSearchStore } from '../../store/search-store';

interface ChatInputProps {
  onSubmit: (message: string) => void;
  disabled?: boolean;
  isFollowUp?: boolean;
  autoFocus?: boolean;
  onStop?: () => void;
}

export function ChatInput({ onSubmit, disabled = false, isFollowUp = false, autoFocus = false, onStop }: ChatInputProps) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { isProMode, toggleProMode } = useSearchStore();

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSubmit(input.trim());
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={disabled}
        placeholder={isFollowUp ? "Ask follow-up..." : "Ask anything..."}
        className={cn(
          "w-full px-4 py-3.5 md:py-4 rounded-2xl bg-perplexity-card text-perplexity-text placeholder-perplexity-muted",
          "border border-transparent focus:border-perplexity-accent/20 focus:ring-2 focus:ring-perplexity-accent/20",
          "transition-all duration-200 text-base md:text-lg",
          "shadow-lg shadow-perplexity-card/10",
          disabled ? "bg-perplexity-card/50" : "hover:bg-perplexity-hover/50"
        )}
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 md:gap-2">
        {disabled && onStop && (
          <button
            type="button"
            onClick={onStop}
            className="p-1.5 md:p-2 text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <rect x="4" y="4" width="16" height="16" rx="2" />
            </svg>
          </button>
        )}
        <button
          type="button"
          className="p-1.5 md:p-2 text-perplexity-muted hover:text-perplexity-text hover:bg-perplexity-hover rounded-lg transition-colors"
        >
          <Focus className="w-4 h-4" />
        </button>
        <button
          type="button"
          className="p-1.5 md:p-2 text-perplexity-muted hover:text-perplexity-text hover:bg-perplexity-hover rounded-lg transition-colors"
        >
          <Paperclip className="w-4 h-4" />
        </button>
        <div className="hidden md:block h-6 w-px bg-perplexity-card mx-1" />
        <button
          type="button"
          onClick={toggleProMode}
          className="hidden md:flex items-center gap-1"
        >
          <div className="relative">
            <div className="w-8 h-4 rounded-full bg-perplexity-hover"></div>
            <div className={cn(
              "absolute top-0.5 w-3 h-3 rounded-full transition-all duration-200",
              isProMode 
                ? "left-[calc(100%-14px)] bg-perplexity-accent" 
                : "left-0.5 bg-perplexity-muted"
            )}></div>
          </div>
          <span className={cn(
            "text-sm transition-colors",
            isProMode ? "text-perplexity-accent" : "text-perplexity-muted"
          )}>Pro</span>
        </button>
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="p-1.5 md:p-2 rounded-lg transition-all duration-200 hover:bg-perplexity-accent/10"
        >
          <ArrowRight className={cn(
            "w-4 h-4 transition-colors",
            input.trim() ? "text-perplexity-accent" : "text-perplexity-muted"
          )} />
        </button>
      </div>
    </form>
  );
}