import React from 'react';
import { Bookmark } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  author: {
    name: string;
    avatar: string;
  };
}

const articles: Article[] = [
  {
    id: '1',
    title: "Ralph Lauren's Historic Honor",
    description: "According to Harper's BAZAAR, Ralph Lauren made history on January 4, 2025, when President Joe Biden awarded him the Presidential Medal of Freedom, marking the first time a fashion designer has received this prestigious honor.",
    imageUrl: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80",
    author: {
      name: "mikeharb",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mikeharb"
    }
  },
  {
    id: '2',
    title: "NFL Playoff Schedule 2025",
    description: "As reported by ESPN, the 2025 NFL playoffs are set to begin with Wild Card Weekend featuring six games across three days.",
    imageUrl: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?auto=format&fit=crop&q=80",
    author: {
      name: "mikeharb",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mikeharb"
    }
  },
  {
    id: '3',
    title: "NY's Climate Museum Finds Home",
    description: "The Climate Museum, the first U.S. museum dedicated to climate change, has found a permanent home in New York City.",
    imageUrl: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&q=80",
    author: {
      name: "stephenhob",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=stephenhob"
    }
  }
];

export function DiscoverPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 overflow-auto">
      <div className="flex items-center justify-between mb-8 sticky top-0 bg-perplexity-bg z-10 py-2">
        <h1 className="text-2xl font-semibold">Discover</h1>
        <div className="flex gap-4 overflow-x-auto hide-scrollbar">
          <button className="px-4 py-2 rounded-lg bg-perplexity-card hover:bg-perplexity-hover text-perplexity-text whitespace-nowrap">
            For You
          </button>
          <button className="px-4 py-2 rounded-lg hover:bg-perplexity-hover text-perplexity-muted whitespace-nowrap">
            Top
          </button>
          <button className="px-4 py-2 rounded-lg hover:bg-perplexity-hover text-perplexity-muted whitespace-nowrap">
            Tech & Science
          </button>
          <button className="px-4 py-2 rounded-lg hover:bg-perplexity-hover text-perplexity-muted whitespace-nowrap">
            Finance
          </button>
          <button className="px-4 py-2 rounded-lg hover:bg-perplexity-hover text-perplexity-muted whitespace-nowrap">
            Arts & Culture
          </button>
          <button className="px-4 py-2 rounded-lg hover:bg-perplexity-hover text-perplexity-muted whitespace-nowrap">
            Sports
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {articles.map((article) => (
          <article key={article.id} className="bg-perplexity-card rounded-lg overflow-hidden">
            <div className="aspect-[2/1] relative">
              <img 
                src={article.imageUrl} 
                alt={article.title}
                className="w-full h-full object-cover"
              />
              <button className="absolute top-4 right-4 p-2 rounded-lg bg-perplexity-bg/80 hover:bg-perplexity-bg text-perplexity-muted">
                <Bookmark className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2 line-clamp-2">{article.title}</h2>
              <p className="text-perplexity-muted mb-4 line-clamp-2">{article.description}</p>
              <div className="flex items-center gap-2">
                <img 
                  src={article.author.avatar}
                  alt={article.author.name}
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-sm text-perplexity-muted">{article.author.name}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}