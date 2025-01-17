import React from 'react';
import { Home, Search, FolderClosed, Library, Plus, KeyRound, ChevronLeft } from 'lucide-react';
import { useSearchStore } from '../store/search-store';
import { cn } from '../lib/utils';

type Page = 'home' | 'discover' | 'spaces' | 'library';

interface SidebarProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  onNewThread: () => void;
}

export function Sidebar({ currentPage, onPageChange, onNewThread }: SidebarProps) {
  const { isSidebarCollapsed, toggleSidebar } = useSearchStore();

  return (
    <div className={cn(
      "border-r border-perplexity-card flex flex-col transition-all duration-300",
      isSidebarCollapsed ? "w-16" : "w-64"
    )}>
      <div className="p-4 flex items-center justify-between">
        <button 
          onClick={onNewThread}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg bg-perplexity-card hover:bg-perplexity-hover text-perplexity-text",
            isSidebarCollapsed && "px-2"
          )}
        >
          <Plus className="w-4 h-4" />
          {!isSidebarCollapsed && <span>New Thread</span>}
        </button>
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

      <nav className="flex-1 px-2 space-y-1">
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
        <SidebarItem 
          icon={FolderClosed} 
          label="Spaces" 
          isActive={currentPage === 'spaces'}
          onClick={() => onPageChange('spaces')}
          collapsed={isSidebarCollapsed} 
        />
        <SidebarItem 
          icon={Library} 
          label="Library" 
          isActive={currentPage === 'library'}
          onClick={() => onPageChange('library')}
          collapsed={isSidebarCollapsed} 
        />
      </nav>

      <div className="p-4 border-t border-perplexity-card">
        <button className={cn(
          "w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-perplexity-hover text-perplexity-muted",
          isSidebarCollapsed && "px-2 justify-center"
        )}>
          <KeyRound className="w-4 h-4" />
          {!isSidebarCollapsed && <span>Try Pro</span>}
        </button>
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