import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { openai, DEFAULT_MODEL } from '../../config/api-config';
import { ToolDefinition } from '../tools/tool-registry';

export interface StreamHandlers {
  onToken?: (token: string) => void;
  onToolCall?: (toolCallChunk: string) => void;
}

export interface ChatCompletionOptions {
  tools?: ToolDefinition['tool'][];
  toolChoice?: { type: "function"; function: { name: string } };
  handlers?: StreamHandlers;
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export class OpenAIAPI {
  private client: OpenAI;

  constructor(client = openai) {
    this.client = client;
  }

  /**
   * Create a chat completion with streaming support
   */
  async createChatCompletion(
    messages: ChatCompletionMessageParam[],
    options: ChatCompletionOptions = {}
  ) {
    const stream = await this.client.chat.completions.create({
      messages,
      model: options.model || DEFAULT_MODEL,
      stream: true,
      temperature: options.temperature,
      max_tokens: options.maxTokens,
      ...(options.tools && { tools: options.tools }),
      ...(options.toolChoice && { tool_choice: options.toolChoice })
    });

    let fullResponse = '';
    let toolCallResponse = '';

    for await (const chunk of stream) {
      // Handle regular content
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullResponse += content;
        options.handlers?.onToken?.(content);
      }

      // Handle tool calls
      const toolCallChunk = chunk.choices[0]?.delta?.tool_calls?.[0]?.function?.arguments || '';
      if (toolCallChunk) {
        toolCallResponse += toolCallChunk;
        options.handlers?.onToolCall?.(toolCallChunk);
      }
    }

    return {
      content: fullResponse,
      toolCallResponse
    };
  }

  /**
   * Create a simple chat completion without streaming
   */
  async createSimpleChatCompletion(
    messages: ChatCompletionMessageParam[],
    options: Omit<ChatCompletionOptions, 'handlers'> = {}
  ) {
    const response = await this.client.chat.completions.create({
      messages,
      model: options.model || DEFAULT_MODEL,
      temperature: options.temperature,
      max_tokens: options.maxTokens,
      ...(options.tools && { tools: options.tools }),
      ...(options.toolChoice && { tool_choice: options.toolChoice })
    });

    return response.choices[0]?.message?.content || '';
  }
} 