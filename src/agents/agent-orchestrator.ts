import { SYSTEM_PROMPTS } from '../config/prompts';
import type { AgentContext, AgentStep } from '../types/agent';
import { BaseAgent } from './base-agent';
import { WeatherAgent } from './weather-agent';
import { MixpanelService } from '../services/analytics/mixpanel-service';

export class AgentOrchestrator {
  private static instance: AgentOrchestrator;
  private agents: Map<string, BaseAgent>;
  private analytics: MixpanelService;

  private constructor() {
    this.agents = new Map();
    this.analytics = new MixpanelService();
    this.initializeAgents();
  }

  public static getInstance(): AgentOrchestrator {
    if (!AgentOrchestrator.instance) {
      AgentOrchestrator.instance = new AgentOrchestrator();
    }
    return AgentOrchestrator.instance;
  }

  private initializeAgents() {
    // Initialize agents with language-aware system prompts
    this.agents.set('weather', new WeatherAgent({
      name: 'weather',
      description: 'Gets current weather information for a location',
      systemPrompt: (language: string) => SYSTEM_PROMPTS.AGENT_PLANNING(language)
    }));
  }

  public async process(
    query: string,
    conversationHistory: Array<{ role: 'user' | 'assistant', content: string }>,
    onStepUpdate: (steps: AgentStep[]) => void,
    language: string
  ) {
    try {
      // Initialize steps with language-specific descriptions
      const steps: AgentStep[] = [
        {
          id: 1,
          description: `Planning response in ${language}`,
          requires_search: false,
          requires_tools: [],
          status: 'loading'
        },
        {
          id: 2,
          description: `Searching for relevant information in ${language}`,
          requires_search: true,
          requires_tools: ['web_search'],
          status: 'pending'
        },
        {
          id: 3,
          description: `Consolidating information and generating response in ${language}`,
          requires_search: false,
          requires_tools: [],
          status: 'pending'
        }
      ];

      // Initial update
      onStepUpdate([...steps]);

      // Planning phase with language context
      const planningAgent = new BaseAgent({
        name: 'planner',
        description: `Plans the execution of complex queries in ${language}`,
        systemPrompt: (language: string) => `${SYSTEM_PROMPTS.AGENT_PLANNING(language)}\n\nIMPORTANT: You MUST plan the steps in ${language} only.`
      });

      const plan = await planningAgent.plan(query, language);
      
      // Update step status
      steps[0].status = 'complete';
      steps[1].status = 'loading';
      onStepUpdate([...steps]);

      // Search phase with language context
      const searchAgent = new BaseAgent({
        name: 'searcher',
        description: `Generates focused search queries in ${language}`,
        systemPrompt: (language: string) => `${SYSTEM_PROMPTS.AGENT_SEARCH(language)}\n\nIMPORTANT: You MUST generate search queries in ${language} only.`
      });

      const searchResults = await searchAgent.search(query, plan, language);
      
      // Update step status
      steps[1].status = 'complete';
      steps[2].status = 'loading';
      onStepUpdate([...steps]);

      // Consolidation phase with language context
      const consolidationAgent = new BaseAgent({
        name: 'consolidator',
        description: `Combines information into comprehensive answers in ${language}`,
        systemPrompt: (language: string) => `${SYSTEM_PROMPTS.AGENT_CONSOLIDATION(language)}\n\nIMPORTANT: You MUST provide the final answer in ${language} only.`
      });

      const result = await consolidationAgent.consolidate(
        query,
        plan,
        searchResults,
        language
      );

      // Update final step status
      steps[2].status = 'complete';
      onStepUpdate([...steps]);

      // Return result with steps
      return {
        answer: result.answer,
        sources: result.sources,
        confidence: result.confidence,
        steps: steps
      };

    } catch (error) {
      console.error('Error in agent orchestration:', error);
      throw error;
    }
  }
} 