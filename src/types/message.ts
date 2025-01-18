interface Source {
  id: string;
  title: string;
  url: string;
  snippet: string;
  author?: string;
}

interface AgentStep {
  id: number;
  description: string;
  requires_search: boolean;
  requires_tools: string[];
  status?: 'pending' | 'loading' | 'complete';
}

interface BaseMessage {
  type: 'user' | 'assistant';
  content: string;
  language?: string;
}

interface RegularMessage extends BaseMessage {
  sources?: Source[];
  related?: string[];
}

interface AgentMessage extends BaseMessage {
  sources?: Source[];
  related?: string[];
  steps: AgentStep[];
}

export type Message = RegularMessage | AgentMessage;

export function isAgentMessage(message: Message): message is AgentMessage {
  return 'steps' in message;
}

export type { Source, AgentStep }; 