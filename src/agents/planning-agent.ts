import type { Agent, AgentConfig, AgentContext } from './agent-registry';
import { serviceManager } from '../services/service-manager';

export interface PlanStep {
  id: number;
  description: string;
  requires_search: boolean;
  requires_tools: string[];
}

export interface Plan {
  steps: PlanStep[];
  reasoning: string;
}

const PLANNING_PROMPT = `You are a planning agent that breaks down complex queries into logical steps.
For each query, create a detailed plan with the following:
1. Break down the query into sequential steps
2. For each step, determine if it requires web search
3. For each step, identify which tools might be needed
4. Provide reasoning for the plan

Please provide your response in the specified language.`;

export class PlanningAgent implements Agent {
  config: AgentConfig = {
    name: 'planning_agent',
    description: 'Breaks down complex queries into logical steps',
    systemPrompt: PLANNING_PROMPT
  };

  async execute(context: AgentContext): Promise<Plan> {
    const openai = serviceManager.getOpenAIAPI();
    
    const response = await openai.createChatCompletion([
      { 
        role: 'system', 
        content: `${this.config.systemPrompt}\n\nIMPORTANT: Please provide your response in ${context.language || 'English'}.` 
      },
      { 
        role: 'user', 
        content: `Query: ${context.query}` 
      }
    ], {
      tools: [{
        type: "function",
        function: {
          name: "plan",
          description: "Create a plan for answering the query",
          parameters: {
            type: "object",
            properties: {
              steps: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "number" },
                    description: { type: "string" },
                    requires_search: { type: "boolean" },
                    requires_tools: { 
                      type: "array",
                      items: { type: "string" }
                    }
                  },
                  required: ["id", "description", "requires_search", "requires_tools"]
                }
              },
              reasoning: { type: "string" }
            },
            required: ["steps", "reasoning"]
          }
        }
      }],
      toolChoice: { type: "function", function: { name: "plan" } }
    });

    console.log('OpenAI Response:', {
      content: response.content,
      toolCallResponse: response.toolCallResponse
    });

    if (!response.toolCallResponse) {
      throw new Error('No tool call response received');
    }

    try {
      return JSON.parse(response.toolCallResponse) as Plan;
    } catch (error) {
      console.error('Planning response parsing error:', {
        error,
        response: response.content,
        toolCall: response.toolCallResponse
      });
      throw new Error(`Failed to parse planning response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
} 