import React, { useState, useEffect, useRef } from 'react';
import { Bot, User, ExternalLink, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { StreamingText } from './streaming-text';

interface Source {
  id: string;
  title: string;
  url: string;
  author: string;
  snippet: string;
}

interface MessageProps {
  content: string;
  type: 'user' | 'assistant';
  sources?: Source[];
  related?: string[];
  isFollowUp?: boolean;
  onRelatedClick?: (question: string) => void;
}

export function Message({ content, type, sources, related, isFollowUp, onRelatedClick }: MessageProps) {
  const [isComplete, setIsComplete] = useState(type === 'user');
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [content, isComplete]);

  if (type === 'user') {
    return (
      <div className="text-xl text-perplexity-text mb-4" ref={messageRef}>
        {content}
      </div>
    );
  }

  return (
    <div className="space-y-4" ref={messageRef}>
      {isFollowUp && (
        <h2 className="text-xl font-semibold">{content}</h2>
      )}

      {sources && sources.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-perplexity-muted">Sources</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {sources.map((source) => (
              <a
                key={source.id}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 text-sm bg-perplexity-hover rounded-lg border border-perplexity-card hover:bg-perplexity-card transition-colors"
              >
                <div className="flex items-center justify-between">
                  <h5 className="font-medium text-perplexity-accent">{source.title}</h5>
                  <ExternalLink className="w-4 h-4 text-perplexity-muted" />
                </div>
                <p className="mt-1 text-perplexity-muted line-clamp-2">{source.snippet}</p>
                {source.author && (
                  <p className="mt-1 text-xs text-perplexity-muted">By {source.author}</p>
                )}
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="text-perplexity-text">
        <StreamingText 
          content={content} 
          onComplete={() => setIsComplete(true)}
        />
      </div>

      {related && related.length > 0 && isComplete && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-perplexity-muted">Related questions</h4>
          <div className="flex flex-wrap gap-2">
            {related.map((question, index) => (
              <button
                key={index}
                onClick={() => onRelatedClick?.(question)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-perplexity-hover text-perplexity-text rounded-lg hover:bg-perplexity-card transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                {question}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}