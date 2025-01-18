import OpenAI from 'openai';
import mixpanel from 'mixpanel-browser';

// API Keys
export const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
export const TAVILY_API_KEY = import.meta.env.VITE_TAVILY_API_KEY;
export const MIXPANEL_TOKEN = import.meta.env.VITE_MIXED_PANEL_API_KEY;

// Initialize Mixpanel
if (MIXPANEL_TOKEN) {
  mixpanel.init(MIXPANEL_TOKEN, {
    debug: process.env.NODE_ENV === 'development',
    track_pageview: true,
    persistence: 'localStorage'
  });
  console.info('Mixpanel initialized');
} else {
  console.warn('VITE_MIXED_PANEL_API_KEY is not set in environment variables. Analytics will be disabled.');
}

// OpenAI Client Configuration
export const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: Only use this in development or trusted environments
});

// API Endpoints
export const TAVILY_SEARCH_ENDPOINT = 'https://api.tavily.com/search';

// Model Configuration
export const DEFAULT_MODEL = 'gpt-4o-mini';
export const STREAM_ENABLED = true;

// Rate Limiting and Performance
export const UPDATE_INTERVAL = 50; // ms between UI updates

// Feature Flags
export const ENABLE_WEB_SEARCH = Boolean(TAVILY_API_KEY);
export const ENABLE_ANALYTICS = Boolean(MIXPANEL_TOKEN);

if (!TAVILY_API_KEY) {
  console.warn('VITE_TAVILY_API_KEY is not set in environment variables. Web search will be disabled.');
} 