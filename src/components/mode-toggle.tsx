import React from 'react';
import { Globe, BookOpen, Newspaper } from 'lucide-react';
import { useSearchStore } from '../store/search-store';
import { cn } from '../lib/utils';

export function ModeToggle() {
  const { searchMode, setSearchMode } = useSearchStore();

  const modes = [
    { id: 'web', icon: Globe, label: 'Web' },
    { id: 'academic', icon: BookOpen, label: 'Academic' },
    { id: 'news', icon: Newspaper, label: 'News' },
  ] as const;

  return (
    <div className="flex gap-2 p-2 bg-perplexity-card rounded-lg">
      {modes.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => setSearchMode(id)}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-md transition-colors',
            searchMode === id
              ? 'bg-perplexity-hover text-perplexity-accent'
              : 'text-perplexity-muted hover:bg-perplexity-hover'
          )}
        >
          <Icon className="w-4 h-4" />
          <span className="text-sm font-medium">{label}</span>
        </button>
      ))}
    </div>
  );
}