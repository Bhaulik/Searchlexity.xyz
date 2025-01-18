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

  private async fetchNewsWithImages(category: string, searchType: 'latest' | 'top'): Promise<TavilyResponse> {
    const searchQueries = {
      latest: `latest breaking ${category} news today`,
      top: `top trending ${category} news this week`
    };

    return this.fetchWithErrorHandling<TavilyResponse>(
      this.endpoint,
      {
        method: 'POST',
        headers: this.getAuthHeaders(this.apiKey),
        body: JSON.stringify({
          query: searchQueries[searchType],
          search_depth: "advanced",
          include_images: true,
          include_image_descriptions: true,
          include_answer: false,
          max_results: 25,
          filter: {
            domain_types: ["news"],
            time_period: searchType === 'latest' ? "last_day" : "last_week",
            exclude_domains: [
              "wikipedia.org", "reddit.com", "youtube.com", 
              "facebook.com", "twitter.com", "instagram.com",
              "tiktok.com", "pinterest.com"
            ],
            content_type: ["news"]
          },
          search_params: {
            sort_by: searchType === 'latest' ? "date" : "relevance"
          }
        })
      },
      'News API'
    );
  }

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .trim();
  }

  private getUrlPath(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.toLowerCase();
    } catch {
      return url.toLowerCase();
    }
  }

  private isDuplicate(article: NewsArticle, existingArticles: NewsArticle[]): boolean {
    const normalizedTitle = this.normalizeText(article.title);
    const urlPath = this.getUrlPath(article.url);
    const domain = new URL(article.url).hostname;

    return existingArticles.some(existing => {
      // Check URL path match (ignoring query params)
      if (this.getUrlPath(existing.url) === urlPath) return true;

      // Check for exact title match after normalization
      if (this.normalizeText(existing.title) === normalizedTitle) return true;

      // Check for same domain and very similar title
      const existingDomain = new URL(existing.url).hostname;
      if (domain === existingDomain) {
        const titleSimilarity = this.calculateSimilarity(
          this.normalizeText(existing.title),
          normalizedTitle
        );
        if (titleSimilarity > 0.8) return true;
      }

      return false;
    });
  }

  private calculateSimilarity(str1: string, str2: string): number {
    if (str1 === str2) return 1;
    if (str1.length === 0 || str2.length === 0) return 0;
    
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    const longerLength = longer.length;
    
    if (longerLength === 0) return 1.0;
    
    return (longerLength - this.editDistance(longer, shorter)) / longerLength;
  }

  private editDistance(str1: string, str2: string): number {
    const m = str1.length;
    const n = str2.length;
    const dp: number[][] = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = 1 + Math.min(
            dp[i - 1][j],     // deletion
            dp[i][j - 1],     // insertion
            dp[i - 1][j - 1]  // substitution
          );
        }
      }
    }

    return dp[m][n];
  }

  async getNewsByCategory(
    category: string,
    maxResults = 10
  ): Promise<NewsArticle[]> {
    if (!this.apiKey) return [];

    try {
      // Fetch both latest and top news
      const [latestNews, topNews] = await Promise.all([
        this.fetchNewsWithImages(category, 'latest'),
        this.fetchNewsWithImages(category, 'top')
      ]);

      const articles: NewsArticle[] = [];
      const processResult = (result: TavilyResponse['results'][0], index: number, images: TavilyImage[]) => {
        const article: NewsArticle = {
          title: result.title,
          url: result.url,
          snippet: result.content,
          domain: new URL(result.url).hostname.replace('www.', ''),
          imageUrl: images[index % images.length]?.url,
          imageDescription: images[index % images.length]?.description
        };

        if (!this.isDuplicate(article, articles)) {
          articles.push(article);
        }
      };

      // Process latest news first
      latestNews.results.forEach((result, index) => {
        processResult(result, index, latestNews.images);
      });

      // Then process top news
      topNews.results.forEach((result, index) => {
        processResult(result, index, topNews.images);
      });

      // Return the requested number of articles
      return articles.slice(0, maxResults);
    } catch (error) {
      console.error('Error fetching news:', error);
      return [];
    }
  }
} 