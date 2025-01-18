import { OpenAIAPI } from './api/openai-api';
import { TavilyAPI } from './api/tavily-api';
import { toolRegistry } from './tools/tool-registry';
import { RELATED_QUESTIONS_TOOL } from './tools/related-questions-tool';
import { MATH_TOOL } from './tools/math-tool';
import { MathAPI } from './api/math-api';

/**
 * Service manager that handles all API services and tools.
 * 
 * To add a new tool or API:
 * 1. Create your API class in src/services/api/
 * 2. Create your tool definition in src/services/tools/
 * 3. Add your API key to src/config/api-config.ts
 * 4. Import and initialize here
 * 5. Add getter methods for your service
 */
class ServiceManager {
  private openaiAPI: OpenAIAPI;
  private tavilyAPI: TavilyAPI;
  private mathAPI: MathAPI;

  constructor() {
    console.info('[Service Manager] Initializing services...');

    // Initialize core APIs
    this.openaiAPI = new OpenAIAPI();
    this.tavilyAPI = new TavilyAPI();
    this.mathAPI = new MathAPI();

    console.info('[Service Manager] Core APIs initialized');

    // Register tool categories
    console.debug('[Service Manager] Registering tool categories...');

    toolRegistry.registerCategory(
      'conversation',
      'Tools for managing conversation flow and context'
    );

    toolRegistry.registerCategory(
      'math',
      'Tools for performing mathematical calculations'
    );

    console.debug('[Service Manager] Tool categories registered');

    // Register tools
    console.debug('[Service Manager] Registering tools...');

    toolRegistry.registerTool('conversation', RELATED_QUESTIONS_TOOL);
    toolRegistry.registerTool('math', MATH_TOOL);

    console.debug('[Service Manager] Tools registered');
    console.info('[Service Manager] Service initialization complete');
  }

  // Getter methods for core services
  getOpenAIAPI(): OpenAIAPI {
    return this.openaiAPI;
  }

  getTavilyAPI(): TavilyAPI {
    return this.tavilyAPI;
  }

  getMathAPI(): MathAPI {
    return this.mathAPI;
  }

  getToolRegistry() {
    return toolRegistry;
  }
}

// Export singleton instance
export const serviceManager = new ServiceManager(); 