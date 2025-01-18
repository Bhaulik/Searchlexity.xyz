import type { Agent, AgentConfig, AgentContext } from './agent-registry';
import { serviceManager } from '../services/service-manager';
import type { PlanStep } from './planning-agent';

export interface SearchResult {
  query: string;
  results: Array<{
    title: string;
    url: string;
    content: string;
  }>;
}

const SEARCH_PROMPT = `You are a search agent that generates focused search queries.
Your task is to create a short, specific search query (maximum 400 characters) that will find the most relevant information.
Focus on key terms and concepts, removing unnecessary words.
Do not include detailed explanations or context in the query itself.

Example:
Original: "I need to find detailed information about how photosynthesis works in plants, specifically the light-dependent reactions and how they convert solar energy into chemical energy in the chloroplasts"
Search query: "photosynthesis light-dependent reactions energy conversion process"

Please generate the search query in the specified language.`;

export class SearchAgent implements Agent {
  config: AgentConfig = {
    name: 'search_agent',
    description: 'Handles web searches and information gathering',
    systemPrompt: SEARCH_PROMPT
  };

  async execute(context: AgentContext): Promise<SearchResult[]> {
    const openai = serviceManager.getOpenAIAPI();
    const tavily = serviceManager.getTavilyAPI();
    const step = context.previousResults as PlanStep;
    
    // Generate focused search query
    const queryResponse = await openai.createChatCompletion([
      { 
        role: 'system', 
        content: `${this.config.systemPrompt}\n\nIMPORTANT: Please generate the search query in ${context.language || 'English'}.` 
      },
      { 
        role: 'user', 
        content: `Original query: ${context.query}\nStep: ${step.description}` 
      }
    ]);

    // Ensure query is within limits
    const searchQuery = (queryResponse.content || context.query)
      .trim()
      .slice(0, 400); // Enforce Tavily's limit
    
    try {
      // Perform search with language preference
      const searchResults = await tavily.search(searchQuery, {
        language: context.language || 'en'
      });
      
      return [{
        query: searchQuery,
        results: searchResults.map(result => ({
          title: result.title,
          url: result.url,
          content: result.snippet
        }))
      }];
    } catch (error) {
      console.error('Search error:', error);
      // Return empty results rather than failing the entire process
      return [{
        query: searchQuery,
        results: []
      }];
    }
  }
} 