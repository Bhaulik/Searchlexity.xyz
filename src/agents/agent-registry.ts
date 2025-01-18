import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { serviceManager } from '../services/service-manager';

export interface AgentConfig {
  name: string;
  description: string;
  systemPrompt: string;
}

export interface AgentContext {
  messages: ChatCompletionMessageParam[];
  query: string;
  previousResults?: any;
  language?: string;
}

export interface Agent {
  config: AgentConfig;
  execute(context: AgentContext): Promise<any>;
}

class AgentRegistry {
  private agents: Map<string, Agent> = new Map();

  registerAgent(agent: Agent) {
    if (this.agents.has(agent.config.name)) {
      throw new Error(`Agent ${agent.config.name} already exists`);
    }
    this.agents.set(agent.config.name, agent);
  }

  getAgent(name: string): Agent {
    const agent = this.agents.get(name);
    if (!agent) {
      throw new Error(`Agent ${name} not found`);
    }
    return agent;
  }

  getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }
}

export const agentRegistry = new AgentRegistry(); 