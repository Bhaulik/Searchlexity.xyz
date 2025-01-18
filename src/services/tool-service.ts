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
        description: "Get related follow-up questions based on conversation context",
        parameters: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              description: "Array of 5 contextually relevant follow-up questions",
              items: {
                type: "string"
              },
              minItems: 5,
              maxItems: 5
            }
          },
          required: ["questions"]
        }
      }
    }
  } as const satisfies ToolDefinition
};

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

export interface TavilySearchResult {
  title: string;
  url: string;
  snippet: string;
  score: number;
  published_date?: string;
  domain: string;
}

export interface SearchSource {
  id: string;
  title: string;
  url: string;
  snippet: string;
} 