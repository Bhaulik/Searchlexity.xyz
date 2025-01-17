import { create } from 'zustand';

interface Source {
  id: string;
  title: string;
  url: string;
  author: string;
  snippet: string;
}

interface Message {
  id: string;
  content: string;
  type: 'user' | 'assistant';
  timestamp: Date;
  sources?: Source[];
  related?: string[];
}

interface SearchState {
  messages: Message[];
  isLoading: boolean;
  searchMode: 'web' | 'academic' | 'news';
  theme: 'light' | 'dark';
  isSidebarCollapsed: boolean;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  setLoading: (loading: boolean) => void;
  setSearchMode: (mode: SearchState['searchMode']) => void;
  toggleTheme: () => void;
  clearMessages: () => void;
  toggleSidebar: () => void;
}

export const useSearchStore = create<SearchState>()((set) => ({
  messages: [],
  isLoading: false,
  searchMode: 'web',
  theme: 'light',
  isSidebarCollapsed: false,
  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id: crypto.randomUUID(),
          timestamp: new Date(),
        },
      ],
    })),
  setLoading: (loading) => set({ isLoading: loading }),
  setSearchMode: (mode) => set({ searchMode: mode }),
  toggleTheme: () =>
    set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
  clearMessages: () => set({ messages: [] }),
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
}));