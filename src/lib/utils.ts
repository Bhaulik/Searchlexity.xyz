import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Message } from '../types/message';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface RecentThread {
  id: string;
  title: string;
  timestamp: number;
  expiresAt: number;
  messages: Message[];
}

const STORAGE_KEY = 'recent-threads';
const MAX_THREADS = 5;
const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;

export function updateRecentThread(threadId: string | null, title: string, messages: Message[]) {
  const threads = getRecentThreads();
  const now = Date.now();
  
  // If we have a threadId, update existing thread
  if (threadId) {
    const threadIndex = threads.findIndex(t => t.id === threadId);
    if (threadIndex !== -1) {
      threads[threadIndex] = {
        ...threads[threadIndex],
        messages,
        timestamp: now
      };
      const updatedThreads = [...threads];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedThreads));
      return updatedThreads;
    }
  }
  
  // Check for existing thread with same first message
  const firstUserMessage = messages.find(m => m.type === 'user')?.content;
  if (firstUserMessage) {
    const existingThreadIndex = threads.findIndex(t => 
      t.messages.find(m => m.type === 'user')?.content === firstUserMessage
    );
    
    if (existingThreadIndex !== -1) {
      // Update existing thread
      threads[existingThreadIndex] = {
        ...threads[existingThreadIndex],
        messages,
        timestamp: now
      };
      const updatedThreads = [...threads];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedThreads));
      return updatedThreads;
    }
  }
  
  // Create new thread if no match found
  const newThread: RecentThread = {
    id: threadId || now.toString(),
    title: firstUserMessage || title,
    timestamp: now,
    expiresAt: now + WEEK_IN_MS,
    messages
  };
  
  // Add new thread and keep only the most recent MAX_THREADS
  const updatedThreads = [newThread, ...threads.filter(t => t.id !== newThread.id)].slice(0, MAX_THREADS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedThreads));
  return updatedThreads;
}

export function clearRecentThreads() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getRecentThreads(): RecentThread[] {
  try {
    const now = Date.now();
    const threads = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as RecentThread[];
    
    // Filter out expired threads
    const validThreads = threads.filter(thread => thread.expiresAt > now);
    
    // Update storage if some threads were expired
    if (validThreads.length !== threads.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validThreads));
    }
    
    return validThreads;
  } catch {
    return [];
  }
}