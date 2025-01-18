import { BaseAPIService } from './base-api';
import { TAVILY_API_KEY, TAVILY_SEARCH_ENDPOINT } from '../../config/api-config';

interface TavilyImage {
  url: string;
  description: string;
}

interface TavilyResponse {
  images: TavilyImage[];
  results: Array<{
    title: string;
    url: string;
    content: string;
    score: number;
  }>;
}

export interface NewsArticle {
  title: string;
  url: string;
  snippet: string;
  published_date?: string;
  domain: string;
  imageUrl?: string;
  imageDescription?: string;
}

export class NewsAPI extends BaseAPIService {
  private apiKey: string;
  private endpoint: string;

  constructor(apiKey = TAVILY_API_KEY, endpoint = TAVILY_SEARCH_ENDPOINT) {
    super();
    this.apiKey = apiKey;
    this.endpoint = endpoint;

    if (!this.apiKey) {
      console.warn('Tavily API key not found. News fetching will be disabled.');
    }
  }

  private async fetchNewsWithImages(category: string, page: number = 1): Promise<TavilyResponse> {
    return this.fetchWithErrorHandling<TavilyResponse>(
      this.endpoint,
      {
        method: 'POST',
        headers: this.getAuthHeaders(this.apiKey),
        body: JSON.stringify({
          query: `latest ${category} news page ${page}`,
          search_depth: "advanced",
          include_images: true,
          include_image_descriptions: true,
          include_answer: false,
          max_results: 5, // Request 5 results at a time since that's the image limit
          filter: {
            domain_types: ["news"],
            time_period: "last_week",
            exclude_domains: ["wikipedia.org", "reddit.com"],
            content_type: ["news", "article", "blog_post"]
          }
        })
      },
      'News API'
    );
  }

  /**
   * Fetch news articles for a specific category
   */
  async getNewsByCategory(
    category: string,
    maxResults = 10
  ): Promise<NewsArticle[]> {
    if (!this.apiKey) {
      return [];
    }

    try {
      const numRequests = Math.ceil(maxResults / 5); // Calculate how many requests we need
      const requests = Array.from({ length: numRequests }, (_, i) => 
        this.fetchNewsWithImages(category, i + 1)
      );

      const responses = await Promise.all(requests);
      const articles: NewsArticle[] = [];

      responses.forEach((data) => {
        data.results.forEach((result, index) => {
          if (articles.length < maxResults) {
            articles.push({
              title: result.title,
              url: result.url,
              snippet: result.content,
              domain: new URL(result.url).hostname.replace('www.', ''),
              imageUrl: data.images[index]?.url,
              imageDescription: data.images[index]?.description
            });
          }
        });
      });

      // Remove any duplicate articles based on URL
      const uniqueArticles = Array.from(
        new Map(articles.map(article => [article.url, article])).values()
      );

      return uniqueArticles.slice(0, maxResults);
    } catch (error) {
      console.error('Error fetching news:', error);
      return [];
    }
  }
} 