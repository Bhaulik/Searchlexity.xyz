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
}

interface SearchState {
  messages: Message[];
  isLoading: boolean;
  isSidebarCollapsed: boolean;
  addMessage: (message: Message) => void;
  updateLastMessage: (message: Message) => void;
  setLoading: (loading: boolean) => void;
  toggleSidebar: () => void;
  clearMessages: () => void;
  setMessages: (messages: Message[]) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  messages: [],
  isLoading: false,
  isSidebarCollapsed: false,
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
  clearMessages: () => set({ messages: [] }),
  setMessages: (messages) => set({ messages })
}));