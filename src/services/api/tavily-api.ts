import { BaseAPIService } from './base-api';
import { TAVILY_API_KEY, TAVILY_SEARCH_ENDPOINT } from '../../config/api-config';

export interface TavilySearchResult {
  title: string;
  url: string;
  snippet: string;
  score: number;
  published_date?: string;
  domain: string;
  image_url?: string;
}

export interface TavilySearchOptions {
  search_depth?: "basic" | "advanced";
  include_images?: boolean;
  include_answer?: boolean;
  max_results?: number;
}

export const DEFAULT_SEARCH_OPTIONS: TavilySearchOptions = {
  search_depth: "advanced",
  include_images: false,
  include_answer: false,
  max_results: 5
} as const;

export class TavilyAPI extends BaseAPIService {
  private apiKey: string;
  private endpoint: string;

  constructor(apiKey = TAVILY_API_KEY, endpoint = TAVILY_SEARCH_ENDPOINT) {
    super();
    this.apiKey = apiKey;
    this.endpoint = endpoint;

    if (!this.apiKey) {
      console.warn('Tavily API key not found. Web search will be disabled.');
    }
  }

  /**
   * Perform a web search using the Tavily API
   */
  async search(
    query: string,
    options: TavilySearchOptions = DEFAULT_SEARCH_OPTIONS
  ): Promise<TavilySearchResult[]> {
    if (!this.apiKey) {
      return [];
    }

    try {
      const data = await this.fetchWithErrorHandling<{ results: TavilySearchResult[] }>(
        this.endpoint,
        {
          method: 'POST',
          headers: this.getAuthHeaders(this.apiKey),
          body: JSON.stringify({
            query,
            ...options
          })
        },
        'Tavily API'
      );

      return data.results || [];
    } catch (error) {
      console.error('Error searching web:', error);
      return [];
    }
  }

  /**
   * Format search results into a context string
   */
  formatResults(results: TavilySearchResult[]): string {
    return results
      .map(result => `[Source: ${result.title}]\n${result.snippet}\n`)
      .join('\n');
  }
} 