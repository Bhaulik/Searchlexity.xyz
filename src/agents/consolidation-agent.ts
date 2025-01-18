import type { Agent, AgentConfig, AgentContext } from './agent-registry';
import type { SearchResult } from './search-agent';
import type { Plan } from './planning-agent';
import { serviceManager } from '../services/service-manager';

export interface ConsolidatedResponse {
  answer: string;
  sources: Array<{
    title: string;
    url: string;
  }>;
  confidence: number;
}

const CONSOLIDATION_PROMPT = `You are a consolidation agent that combines information from multiple sources to create comprehensive answers.
Your task is to:
1. Review all search results and tool outputs
2. Identify the most relevant and reliable information
3. Synthesize a clear, coherent answer
4. Cite sources appropriately
5. Assess confidence in the answer (0-1)

Please provide your response in the specified language.

Format your response as JSON:
{
  "answer": "detailed answer with inline citations [1], [2], etc.",
  "sources": [{"title": "source title", "url": "source url"}],
  "confidence": 0.95
}`;

export class ConsolidationAgent implements Agent {
  config: AgentConfig = {
    name: 'consolidation_agent',
    description: 'Combines information from multiple sources into coherent answers',
    systemPrompt: CONSOLIDATION_PROMPT
  };

  async execute(context: AgentContext): Promise<ConsolidatedResponse> {
    const openai = serviceManager.getOpenAIAPI();
    const plan = context.previousResults.plan as Plan;
    const searchResults = context.previousResults.searchResults as SearchResult[];
    
    // Format search results for the prompt
    const searchContext = searchResults
      .map(result => result.results
        .map(r => `Source: ${r.title}\nURL: ${r.url}\nContent: ${r.content}`)
        .join('\n\n'))
      .join('\n\n');

    const response = await openai.createChatCompletion([
      { 
        role: 'system', 
        content: `${this.config.systemPrompt}\n\nIMPORTANT: Please provide your response in ${context.language || 'English'}.` 
      },
      { 
        role: 'user', 
        content: `Original query: ${context.query}\n\nPlan:\n${JSON.stringify(plan, null, 2)}\n\nSearch Results:\n${searchContext}` 
      }
    ]);

    try {
      return JSON.parse(response.content) as ConsolidatedResponse;
    } catch (error) {
      // Fallback if JSON parsing fails
      return {
        answer: response.content || 'Failed to generate response',
        sources: searchResults.flatMap(r => r.results.map(s => ({ 
          title: s.title, 
          url: s.url 
        }))),
        confidence: 0.5
      };
    }
  }
} 