import { create } from 'zustand';
import type { Message } from '../types/message';

interface SearchState {
  messages: Message[];
  isLoading: boolean;
  isProMode: boolean;
  selectedLanguage: string;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateLastMessage: (message: Message) => void;
  clearMessages: () => void;
  setLoading: (loading: boolean) => void;
  toggleProMode: () => void;
  setSelectedLanguage: (language: string) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  messages: [],
  isLoading: false,
  isProMode: false,
  selectedLanguage: 'en',
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  updateLastMessage: (message) => set((state) => ({
    messages: [...state.messages.slice(0, -1), message]
  })),
  clearMessages: () => set({ messages: [] }),
  setLoading: (loading) => set({ isLoading: loading }),
  toggleProMode: () => set((state) => ({ isProMode: !state.isProMode })),
  setSelectedLanguage: (language) => set({ selectedLanguage: language })
}));