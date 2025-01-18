import type { ChatCompletionTool } from 'openai/resources/chat/completions';

export interface ToolDefinition {
  name: string;
  description: string;
  tool: ChatCompletionTool;
}

export const TOOLS = {
  RELATED_QUESTIONS: {
    name: "get_related_questions",
    description: "Get related follow-up questions based on conversation context",
    tool: {
      type: "function",
      function: {
        name: "get_related_questions",
        description: "Generate related follow-up questions based on the conversation context",
        parameters: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: {
                type: "string"
              },
              description: "Array of related questions"
            }
          },
          required: ["questions"]
        }
      }
    }
  },
  EXTRACT_LOCATION: {
    name: "extract_location",
    description: "Extract location information from text",
    tool: {
      type: "function",
      function: {
        name: "extract_location",
        description: "Extract location information from the given text",
        parameters: {
          type: "object",
          properties: {
            location: {
              type: "string",
              description: "The extracted location"
            }
          },
          required: ["location"]
        }
      }
    }
  },
  GET_WEATHER: {
    name: "get_weather",
    description: "Get weather information for a location",
    tool: {
      type: "function",
      function: {
        name: "get_weather",
        description: "Get current weather information for the specified location",
        parameters: {
          type: "object",
          properties: {
            temperature: {
              type: "number",
              description: "Current temperature in Celsius"
            },
            condition: {
              type: "string",
              description: "Weather condition (e.g., sunny, cloudy, rainy)"
            },
            humidity: {
              type: "number",
              description: "Humidity percentage"
            },
            wind_speed: {
              type: "number",
              description: "Wind speed in km/h"
            }
          },
          required: ["temperature", "condition", "humidity", "wind_speed"]
        }
      }
    }
  }
} as const;

export interface WebSearchOptions {
  search_depth?: "basic" | "advanced";
  include_images?: boolean;
  include_answer?: boolean;
  max_results?: number;
}

export const DEFAULT_SEARCH_OPTIONS: WebSearchOptions = {
  search_depth: "advanced",
  include_images: false,
  include_answer: false,
  max_results: 5
} as const;

export interface TavilySearchOptions {
  max_results?: number;
  search_depth?: 'basic' | 'advanced';
  include_domains?: string[];
  exclude_domains?: string[];
  include_answer?: boolean;
  language?: string;
}

export interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  snippet: string;
  score: number;
  published_date?: string;
  author?: string;
}

export interface SearchSource {
  id: string;
  title: string;
  url: string;
  snippet: string;
} 