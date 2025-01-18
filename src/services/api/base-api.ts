/**
 * Base class for API services with common functionality
 */
export abstract class BaseAPIService {
  protected async fetchWithErrorHandling<T>(
    url: string,
    options: RequestInit,
    errorPrefix: string
  ): Promise<T> {
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error(`${errorPrefix} error details:`, errorText);
        throw new Error(`${errorPrefix}: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error in ${errorPrefix}:`, error);
      throw error;
    }
  }

  protected getAuthHeaders(apiKey: string): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    };
  }
} 