import React, { useState, useRef, useEffect } from 'react';
import { Focus, Paperclip, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

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
          "w-full px-4 py-4 rounded-2xl bg-perplexity-card text-perplexity-text placeholder-perplexity-muted",
          "border border-transparent focus:border-perplexity-accent/20 focus:ring-1 focus:ring-perplexity-accent/20",
          "transition-colors duration-200 text-lg"
        )}
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
        {disabled && onStop && (
          <button
            type="button"
            onClick={onStop}
            className="p-2 text-red-500 hover:text-red-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <rect x="4" y="4" width="16" height="16" rx="2" />
            </svg>
          </button>
        )}
        <button
          type="button"
          className="p-2 text-perplexity-muted hover:text-perplexity-text transition-colors"
        >
          <Focus className="w-4 h-4" />
        </button>
        <button
          type="button"
          className="p-2 text-perplexity-muted hover:text-perplexity-text transition-colors"
        >
          <Paperclip className="w-4 h-4" />
        </button>
        <div className="h-6 w-px bg-perplexity-card mx-1" />
        <div className="flex items-center gap-1">
          <div className="relative">
            <div className="w-8 h-4 rounded-full bg-perplexity-hover"></div>
            <div className="absolute left-0.5 top-0.5 w-3 h-3 rounded-full bg-perplexity-muted"></div>
          </div>
          <span className="text-sm text-perplexity-muted">Pro</span>
        </div>
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="ml-1"
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