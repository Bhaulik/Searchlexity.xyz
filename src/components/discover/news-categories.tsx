import React from 'react';
import { Newspaper, Briefcase, Globe, Microscope, Film, Gamepad, Heart, DollarSign } from 'lucide-react';
import { cn } from '../../lib/utils';

export const NEWS_CATEGORIES = [
  { id: 'general', label: 'General', icon: Newspaper },
  { id: 'business', label: 'Business', icon: Briefcase },
  { id: 'world', label: 'World', icon: Globe },
  { id: 'science', label: 'Science', icon: Microscope },
  { id: 'entertainment', label: 'Entertainment', icon: Film },
  { id: 'gaming', label: 'Gaming', icon: Gamepad },
  { id: 'health', label: 'Health', icon: Heart },
  { id: 'finance', label: 'Finance', icon: DollarSign },
] as const;

interface NewsCategoriesProps {
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  collapsed: boolean;
}

export function NewsCategories({ selectedCategory, onCategorySelect, collapsed }: NewsCategoriesProps) {
  return (
    <div className="space-y-1">
      {!collapsed && (
        <div className="px-3 py-2">
          <h2 className="text-sm font-medium text-perplexity-muted">Categories</h2>
        </div>
      )}
      {NEWS_CATEGORIES.map((category) => {
        const Icon = category.icon;
        return (
          <button
            key={category.id}
            onClick={() => onCategorySelect(category.id)}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-perplexity-hover",
              selectedCategory === category.id ? "text-perplexity-text bg-perplexity-hover" : "text-perplexity-muted",
              collapsed && "px-2 justify-center"
            )}
          >
            <Icon className="w-4 h-4" />
            {!collapsed && <span>{category.label}</span>}
          </button>
        );
      })}
    </div>
  );
} 