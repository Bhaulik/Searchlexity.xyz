import { agentRegistry } from './agent-registry';
import { PlanningAgent } from './planning-agent';
import { SearchAgent } from './search-agent';
import { ConsolidationAgent } from './consolidation-agent';
import type { ConsolidatedResponse } from './consolidation-agent';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export interface AgentStep {
  id: number;
  description: string;
  requires_search: boolean;
  requires_tools: string[];
  status: 'pending' | 'loading' | 'complete';
}

export type StepUpdateCallback = (steps: AgentStep[]) => void;

export class AgentOrchestrator {
  private static instance: AgentOrchestrator;
  private initialized = false;

  private constructor() {
    this.initializeAgents();
  }

  public static getInstance(): AgentOrchestrator {
    if (!AgentOrchestrator.instance) {
      AgentOrchestrator.instance = new AgentOrchestrator();
    }
    return AgentOrchestrator.instance;
  }

  private initializeAgents() {
    if (this.initialized) return;
    
    // Register all agents
    agentRegistry.registerAgent(new PlanningAgent());
    agentRegistry.registerAgent(new SearchAgent());
    agentRegistry.registerAgent(new ConsolidationAgent());
    
    this.initialized = true;
  }

  async process(
    query: string,
    messages: ChatCompletionMessageParam[] = [],
    onStepUpdate?: StepUpdateCallback
  ): Promise<ConsolidatedResponse & { steps: AgentStep[] }> {
    try {
      const steps: AgentStep[] = [
        {
          id: 1,
          description: "Planning the response",
          requires_search: false,
          requires_tools: [],
          status: 'loading'
        },
        {
          id: 2,
          description: "Searching for relevant information",
          requires_search: true,
          requires_tools: ['web_search'],
          status: 'pending'
        },
        {
          id: 3,
          description: "Consolidating information and generating response",
          requires_search: false,
          requires_tools: [],
          status: 'pending'
        }
      ];

      // Initial steps
      onStepUpdate?.(steps);

      // Step 1: Planning
      const planningAgent = agentRegistry.getAgent('planning_agent');
      const plan = await planningAgent.execute({ query, messages });

      steps[0].status = 'complete';
      steps[1].status = 'loading';
      onStepUpdate?.(steps);

      // Step 2: Search (for steps that require it)
      const searchAgent = agentRegistry.getAgent('search_agent');
      const searchResults = [];

      for (const step of plan.steps) {
        if (step.requires_search) {
          const stepResults = await searchAgent.execute({
            query,
            messages,
            previousResults: step
          });
          searchResults.push(...stepResults);
        }
      }

      steps[1].status = 'complete';
      steps[2].status = 'loading';
      onStepUpdate?.(steps);

      // Step 3: Consolidation
      const consolidationAgent = agentRegistry.getAgent('consolidation_agent');
      const result = await consolidationAgent.execute({
        query,
        messages,
        previousResults: {
          plan,
          searchResults
        }
      });

      steps[2].status = 'complete';
      onStepUpdate?.(steps);

      return {
        ...result,
        steps
      };
    } catch (error) {
      console.error('Agent orchestration error:', error);
      return {
        answer: 'I encountered an error while processing your request. Please try again.',
        sources: [],
        confidence: 0,
        steps: [{
          id: 1,
          description: "Error occurred during processing",
          requires_search: false,
          requires_tools: [],
          status: 'pending'
        }]
      };
    }
  }
} 