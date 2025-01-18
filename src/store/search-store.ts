import { create } from 'zustand';
import type { Message } from '../types/message';

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