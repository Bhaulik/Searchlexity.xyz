import React, { useEffect, useState, useCallback } from 'react';
import { Newspaper, Briefcase, Globe, Microscope, Film, Gamepad, Heart, DollarSign } from 'lucide-react';
import { cn } from '../../lib/utils';
import { serviceManager } from '../../services/service-manager';
import type { NewsArticle } from '../../services/api/news-api';

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

type CategoryId = typeof NEWS_CATEGORIES[number]['id'];

type CategoryNews = {
  [K in CategoryId]: NewsArticle[];
};

type FetchTimes = {
  [K in CategoryId]?: number;
};

// Rate limit: 1 request per category per minute
const RATE_LIMIT_MS = 60 * 1000;
const INITIAL_CATEGORY: CategoryId = 'general';

// Keep news cache in memory between tab switches
const globalNewsCache: Partial<CategoryNews> = {};
const globalFetchTimes: FetchTimes = {};

export function DiscoverPage() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>(INITIAL_CATEGORY);
  const [newsCache, setNewsCache] = useState<Partial<CategoryNews>>(globalNewsCache);
  const [isLoading, setIsLoading] = useState(!globalNewsCache[INITIAL_CATEGORY]);
  const [lastFetchTimes, setLastFetchTimes] = useState<FetchTimes>(globalFetchTimes);

  const loadCategoryNews = useCallback(async (categoryId: CategoryId) => {
    const now = Date.now();
    const lastFetch = lastFetchTimes[categoryId] || 0;
    
    // Check rate limit and cache
    if (now - lastFetch < RATE_LIMIT_MS && newsCache[categoryId]?.length) {
      return;
    }

    setIsLoading(true);
    const newsApi = serviceManager.getNewsAPI();
    
    try {
      const articles = await newsApi.getNewsByCategory(categoryId);
      const updatedCache = {
        ...newsCache,
        [categoryId]: articles
      };
      setNewsCache(updatedCache);
      Object.assign(globalNewsCache, updatedCache);

      const updatedFetchTimes = {
        ...lastFetchTimes,
        [categoryId]: now
      };
      setLastFetchTimes(updatedFetchTimes);
      Object.assign(globalFetchTimes, updatedFetchTimes);
    } catch (error) {
      console.error(`Error loading ${categoryId} news:`, error);
    } finally {
      setIsLoading(false);
    }
  }, [lastFetchTimes, newsCache]);

  // Load initial category if not cached
  useEffect(() => {
    if (!newsCache[INITIAL_CATEGORY]?.length) {
      loadCategoryNews(INITIAL_CATEGORY);
    }

    // Refresh initial category every 5 minutes if tab is active
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadCategoryNews(INITIAL_CATEGORY);
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [loadCategoryNews, newsCache]);

  // Load selected category if needed
  useEffect(() => {
    if (selectedCategory !== INITIAL_CATEGORY && !newsCache[selectedCategory]?.length) {
      loadCategoryNews(selectedCategory);
    }
  }, [selectedCategory, loadCategoryNews, newsCache]);

  const handleCategorySelect = (categoryId: CategoryId) => {
    setSelectedCategory(categoryId);
    if (!newsCache[categoryId]?.length) {
      loadCategoryNews(categoryId);
    }
  };

  const currentArticles = newsCache[selectedCategory] || [];

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Categories Header */}
      <div className="border-b border-perplexity-card">
        <div className="flex items-center gap-2 px-4 py-2 overflow-x-auto">
          {NEWS_CATEGORIES.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.id;

            return (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors",
                  isSelected 
                    ? "bg-perplexity-card text-perplexity-text" 
                    : "text-perplexity-muted hover:bg-perplexity-hover"
                )}
                disabled={isLoading && isSelected}
              >
                <Icon className="w-4 h-4" />
                <span>{category.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Articles Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading && !currentArticles.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-perplexity-card animate-pulse rounded-lg overflow-hidden">
                <div className="aspect-video bg-perplexity-hover"></div>
                <div className="p-4 space-y-3">
                  <div className="h-6 bg-perplexity-hover rounded"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-perplexity-hover rounded w-5/6"></div>
                    <div className="h-4 bg-perplexity-hover rounded w-4/6"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentArticles.map((article: NewsArticle) => (
              <a
                key={article.url}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-perplexity-card rounded-lg overflow-hidden hover:ring-1 hover:ring-perplexity-accent transition-all"
              >
                <div className="aspect-video w-full overflow-hidden bg-perplexity-hover">
                  {article.imageUrl ? (
                    <img 
                      src={article.imageUrl} 
                      alt={article.imageDescription || article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-perplexity-muted">
                      <Icon category={selectedCategory} className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-perplexity-text group-hover:text-perplexity-accent mb-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-perplexity-muted line-clamp-3">
                    {article.snippet}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-xs text-perplexity-muted">
                    <span>{article.domain}</span>
                    {article.published_date && (
                      <span>{new Date(article.published_date).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper component for category icons
function Icon({ category, className }: { category: CategoryId; className?: string }) {
  const categoryConfig = NEWS_CATEGORIES.find(c => c.id === category);
  const IconComponent = categoryConfig?.icon || Newspaper;
  return <IconComponent className={className} />;
}