import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { ChatInput } from './chat/chat-input';
import { cn } from '../lib/utils';

interface NewThreadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (message: string) => void;
}

export function NewThreadDialog({ isOpen, onClose, onSubmit }: NewThreadDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (message: string) => {
    onSubmit(message);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div 
        ref={dialogRef}
        className={cn(
          "w-full max-w-2xl mx-4 bg-perplexity-bg rounded-2xl",
          "border border-perplexity-card shadow-2xl",
          "transform transition-all duration-200 ease-out",
          "animate-in fade-in slide-in-from-bottom-4"
        )}
      >
        <div className="p-6 space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-medium text-perplexity-text">What do you want to know?</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-perplexity-hover rounded-lg text-perplexity-muted transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <ChatInput onSubmit={handleSubmit} autoFocus />
        </div>
      </div>
    </div>
  );
}