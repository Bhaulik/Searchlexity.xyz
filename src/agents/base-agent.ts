import type { AgentConfig, AgentContext, AgentResult, AgentStep } from '../types/agent';
import { createChatCompletion } from '../services/llm-service';
import { searchWeb, formatSearchContext } from '../services/llm-service';

export class BaseAgent {
  protected config: AgentConfig;
  protected steps: AgentStep[] = [];

  constructor(config: AgentConfig) {
    this.config = config;
  }

  protected async plan(query: string, language: string): Promise<AgentResult> {
    const systemPrompt = this.config.systemPrompt(language);
    const response = await createChatCompletion([
      { 
        role: 'system', 
        content: `${systemPrompt}\n\nIMPORTANT: Your response must be valid JSON matching this schema:
        {
          "answer": "string - your detailed plan",
          "sources": [],
          "confidence": number between 0 and 1,
          "steps": [
            {
              "id": number,
              "description": "string",
              "requires_search": boolean,
              "requires_tools": string[],
              "status": "pending"
            }
          ]
        }`
      },
      { role: 'user', content: query }
    ]);

    try {
      const parsedResponse = JSON.parse(response.content);
      
      // Validate the response structure
      if (!parsedResponse.answer || typeof parsedResponse.answer !== 'string') {
        throw new Error('Invalid response format: missing or invalid answer');
      }
      
      if (!Array.isArray(parsedResponse.sources)) {
        parsedResponse.sources = [];
      }
      
      if (typeof parsedResponse.confidence !== 'number' || parsedResponse.confidence < 0 || parsedResponse.confidence > 1) {
        parsedResponse.confidence = 0.7; // Default confidence
      }

      return parsedResponse;
    } catch (error) {
      console.error('Error parsing plan response:', error);
      // Return a fallback response
      return {
        answer: response.content, // Use the raw response as the answer
        sources: [],
        confidence: 0.7,
        steps: [{
          id: 1,
          description: "Process the query",
          requires_search: true,
          requires_tools: [],
          status: "pending"
        }]
      };
    }
  }

  protected async search(query: string, plan: AgentResult, language: string): Promise<any[]> {
    const searchResults = [];
    
    // Generate search query based on plan
    const searchQuery = await createChatCompletion([
      { 
        role: 'system', 
        content: `${this.config.systemPrompt(language)}\n\nIMPORTANT: Generate a concise search query. Do not include any explanations or JSON formatting.`
      },
      { role: 'user', content: `Original query: ${query}\n\nPlan:\n${JSON.stringify(plan, null, 2)}` }
    ]);

    // Execute search
    const results = await searchWeb(searchQuery.content);
    searchResults.push(...results);

    return searchResults;
  }

  protected async consolidate(
    query: string,
    plan: AgentResult,
    searchResults: any[],
    language: string
  ): Promise<AgentResult> {
    const searchContext = formatSearchContext(searchResults);
    
    const response = await createChatCompletion([
      { 
        role: 'system', 
        content: `${this.config.systemPrompt(language)}\n\nIMPORTANT: Your response must be valid JSON matching this schema:
        {
          "answer": "string - your detailed answer with citations [1], [2], etc.",
          "sources": [{"title": "string", "url": "string"}],
          "confidence": number between 0 and 1
        }`
      },
      { 
        role: 'user', 
        content: `Original query: ${query}\n\nPlan:\n${JSON.stringify(plan, null, 2)}\n\nSearch Results:\n${searchContext}` 
      }
    ]);

    try {
      const parsedResponse = JSON.parse(response.content);
      
      // Validate the response structure
      if (!parsedResponse.answer || typeof parsedResponse.answer !== 'string') {
        throw new Error('Invalid response format: missing or invalid answer');
      }
      
      if (!Array.isArray(parsedResponse.sources)) {
        parsedResponse.sources = searchResults.map(result => ({
          title: result.title,
          url: result.url
        }));
      }
      
      if (typeof parsedResponse.confidence !== 'number' || parsedResponse.confidence < 0 || parsedResponse.confidence > 1) {
        parsedResponse.confidence = 0.7; // Default confidence
      }

      return parsedResponse;
    } catch (error) {
      console.error('Error parsing consolidation response:', error);
      // Return a fallback response
      return {
        answer: response.content, // Use the raw response as the answer
        sources: searchResults.map(result => ({
          title: result.title,
          url: result.url
        })),
        confidence: 0.7
      };
    }
  }
} 