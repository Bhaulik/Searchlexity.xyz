import React, { useEffect, useState } from 'react';
import { Home, Search, Plus, ChevronLeft, Globe, Clock, Trash2 } from 'lucide-react';
import { useSearchStore } from '../store/search-store';
import { cn, getRecentThreads, clearRecentThreads } from '../lib/utils';
import { motion } from 'framer-motion';

type Page = 'home' | 'discover';

interface SidebarProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  onNewThread: () => void;
}

export function Sidebar({ currentPage, onPageChange, onNewThread }: SidebarProps) {
  const { isSidebarCollapsed, toggleSidebar, setMessages, clearMessages } = useSearchStore();
  const [recentThreads, setRecentThreads] = useState(getRecentThreads());

  const handleThreadClick = (thread: ReturnType<typeof getRecentThreads>[0]) => {
    onPageChange('home');
    setMessages(thread.messages);
  };

  const handleClearHistory = () => {
    clearRecentThreads();
    setRecentThreads([]);
    clearMessages();
    onPageChange('home');
  };

  useEffect(() => {
    setRecentThreads(getRecentThreads());
    const interval = setInterval(() => {
      setRecentThreads(getRecentThreads());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={cn(
      "flex flex-col border-r border-perplexity-card h-full",
      isSidebarCollapsed ? "w-16" : "w-64"
    )}>
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ 
              rotate: 360,
            }}
            transition={{ 
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="text-perplexity-accent"
          >
            <Globe className="w-6 h-6" />
          </motion.div>
          {!isSidebarCollapsed && (
            <span className="font-semibold text-perplexity-text">Searchlexity.xyz</span>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-perplexity-hover rounded-lg text-perplexity-muted"
        >
          <ChevronLeft className={cn(
            "w-4 h-4 transition-transform",
            isSidebarCollapsed && "rotate-180"
          )} />
        </button>
      </div>

      <button 
        onClick={onNewThread}
        className={cn(
          "mx-4 mb-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-perplexity-card hover:bg-perplexity-hover text-perplexity-text",
          isSidebarCollapsed && "px-2"
        )}
      >
        <Plus className="w-4 h-4" />
        {!isSidebarCollapsed && <span>New Thread</span>}
      </button>

      <div className="flex-1 flex flex-col min-h-0">
        <nav className="flex-1 px-2 space-y-1 overflow-y-auto">
          <SidebarItem 
            icon={Home} 
            label="Home" 
            isActive={currentPage === 'home'}
            onClick={() => onPageChange('home')}
            collapsed={isSidebarCollapsed} 
          />
          <SidebarItem 
            icon={Search} 
            label="Discover" 
            isActive={currentPage === 'discover'}
            onClick={() => onPageChange('discover')}
            collapsed={isSidebarCollapsed} 
          />

          {recentThreads.length > 0 && !isSidebarCollapsed && currentPage === 'home' && (
            <>
              <div className="pt-4 pb-2">
                <div className="px-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-perplexity-muted" />
                    <span className="text-sm font-medium text-perplexity-muted">Recent</span>
                  </div>
                  <button
                    onClick={handleClearHistory}
                    className="p-1 hover:bg-perplexity-hover rounded text-perplexity-muted hover:text-red-500 transition-colors"
                    title="Clear history"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {recentThreads.map((thread) => {
                const firstUserMessage = thread.messages?.find(m => m?.type === 'user')?.content || thread.title;
                const messages = thread.messages || [];
                
                return (
                  <button
                    key={thread.id}
                    onClick={() => handleThreadClick(thread)}
                    className="w-full text-left px-4 py-2.5 hover:bg-perplexity-hover/50 rounded-lg transition-colors group ml-2"
                  >
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="text-sm text-perplexity-text group-hover:text-perplexity-accent font-medium truncate">
                        {firstUserMessage}
                      </div>
                      <div className="space-y-0.5">
                        {messages.filter(Boolean).map((message, i) => (
                          <div key={i} className="text-xs truncate">
                            <span className={cn(
                              "mr-1 font-medium",
                              message.type === 'user' ? 'text-perplexity-accent' : 'text-perplexity-text'
                            )}>
                              {message.type === 'user' ? 'Q:' : 'A:'}
                            </span>
                            <span className="text-perplexity-muted">{message.content.substring(0, 60)}{message.content.length > 60 ? '...' : ''}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </button>
                );
              })}
            </>
          )}
        </nav>
      </div>
    </div>
  );
}

interface SidebarItemProps {
  icon: any;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  collapsed: boolean;
}

function SidebarItem({ icon: Icon, label, isActive, onClick, collapsed }: SidebarItemProps) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-perplexity-hover",
        isActive ? "text-perplexity-text bg-perplexity-hover" : "text-perplexity-muted",
        collapsed && "px-2 justify-center"
      )}
    >
      <Icon className="w-4 h-4" />
      {!collapsed && <span>{label}</span>}
    </button>
  );
}