import { create } from 'zustand';

interface Message {
  type: 'user' | 'assistant';
  content: string;
  sources?: Array<{
    id: string;
    title: string;
    url: string;
    snippet: string;
    author?: string;
  }>;
  related?: string[];
  steps?: Array<{
    id: number;
    description: string;
    requires_search: boolean;
    requires_tools: string[];
    status?: 'pending' | 'loading' | 'complete';
  }>;
}

interface SearchState {
  messages: Message[];
  isLoading: boolean;
  isSidebarCollapsed: boolean;
  isProMode: boolean;
  addMessage: (message: Message) => void;
  updateLastMessage: (message: Message) => void;
  setLoading: (loading: boolean) => void;
  toggleSidebar: () => void;
  toggleProMode: () => void;
  clearMessages: () => void;
  setMessages: (messages: Message[]) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  messages: [],
  isLoading: false,
  isSidebarCollapsed: false,
  isProMode: false,
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
  updateLastMessage: (message) => set((state) => ({
    messages: [...state.messages.slice(0, -1), message]
  })),
  setLoading: (loading) => set({ isLoading: loading }),
  toggleSidebar: () => set((state) => ({ 
    isSidebarCollapsed: !state.isSidebarCollapsed 
  })),
  toggleProMode: () => set((state) => ({
    isProMode: !state.isProMode
  })),
  clearMessages: () => set({ messages: [] }),
  setMessages: (messages) => set({ messages })
}));