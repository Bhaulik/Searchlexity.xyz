import { OpenAIAPI } from './api/openai-api';
import { TavilyAPI } from './api/tavily-api';
import { toolRegistry } from './tools/tool-registry';
import { RELATED_QUESTIONS_TOOL } from './tools/related-questions-tool';

/**
 * Service manager that handles all API services and tools
 */
class ServiceManager {
  private openaiAPI: OpenAIAPI;
  private tavilyAPI: TavilyAPI;

  constructor() {
    // Initialize APIs
    this.openaiAPI = new OpenAIAPI();
    this.tavilyAPI = new TavilyAPI();

    // Register tool categories
    toolRegistry.registerCategory(
      'conversation',
      'Tools for managing conversation flow and context'
    );

    // Register tools
    toolRegistry.registerTool('conversation', RELATED_QUESTIONS_TOOL);
  }

  /**
   * Get OpenAI API instance
   */
  getOpenAIAPI(): OpenAIAPI {
    return this.openaiAPI;
  }

  /**
   * Get Tavily API instance
   */
  getTavilyAPI(): TavilyAPI {
    return this.tavilyAPI;
  }

  /**
   * Get tool registry instance
   */
  getToolRegistry() {
    return toolRegistry;
  }

  /**
   * Register a new API service
   */
  registerAPI<T>(name: string, api: T): T {
    (this as any)[`${name}API`] = api;
    return api;
  }
}

// Create and export singleton instance
export const serviceManager = new ServiceManager(); 