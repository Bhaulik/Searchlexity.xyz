export interface AgentStep {
  id: number;
  description: string;
  requires_search: boolean;
  requires_tools: string[];
  status: 'pending' | 'loading' | 'complete';
}

export interface AgentContext {
  query: string;
  language: string;
  previousResults?: any;
}

export interface AgentConfig {
  name: string;
  description: string;
  systemPrompt: (language: string) => string;
}

export interface AgentResult {
  answer: string;
  sources: Array<{
    title: string;
    url: string;
  }>;
  confidence: number;
  steps?: AgentStep[];
} 