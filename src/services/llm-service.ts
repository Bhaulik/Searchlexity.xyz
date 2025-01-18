import { openai, DEFAULT_MODEL, TAVILY_API_KEY, TAVILY_SEARCH_ENDPOINT } from '../config/api-config';
import { SYSTEM_PROMPTS, USER_PROMPTS } from '../config/prompts';
import { TOOLS, type WebSearchOptions, type TavilySearchResult, DEFAULT_SEARCH_OPTIONS } from './tool-service';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

/**
 * Determines whether a web search is necessary for a given query
 */
export async function shouldPerformWebSearch(query: string, language: string = 'en'): Promise<boolean> {
  try {
    const response = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPTS.SEARCH_NECESSITY_CHECK(language)
        },
        {
          role: 'user',
          content: USER_PROMPTS.SEARCH_CHECK(query)
        }
      ],
      model: DEFAULT_MODEL,
      temperature: 0,
      max_tokens: 5
    });
    
    const decision = response.choices[0]?.message?.content?.toLowerCase().includes('true') ?? false;
    return decision;
  } catch (error) {
    console.error('Error determining search necessity:', error);
    return true; // Default to searching if the check fails
  }
}

/**
 * Performs a web search using the Tavily API
 */
export async function searchWeb(
  query: string, 
  options: WebSearchOptions = DEFAULT_SEARCH_OPTIONS
): Promise<TavilySearchResult[]> {
  if (!TAVILY_API_KEY) {
    console.warn('Tavily API key not found. Skipping web search.');
    return [];
  }

  const needsSearch = await shouldPerformWebSearch(query);
  if (!needsSearch) {
    console.log('Web search deemed unnecessary for this query');
    return [];
  }

  try {
    const response = await fetch(TAVILY_SEARCH_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TAVILY_API_KEY}`
      },
      body: JSON.stringify({
        query,
        ...options
      })
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error('Tavily API error details:', errorText);
      throw new Error(`Tavily API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    if (!data.results || !Array.isArray(data.results)) {
      console.warn('Invalid response format from Tavily API');
      return [];
    }
    return data.results;
  } catch (error) {
    console.error('Error searching web:', error);
    return [];
  }
}

interface StreamHandlers {
  onToken?: (token: string) => void;
  onToolCall?: (toolCallChunk: string) => void;
}

/**
 * Creates a chat completion with streaming support
 */
export async function createChatCompletion(
  messages: ChatCompletionMessageParam[],
  options: {
    tools?: typeof TOOLS[keyof typeof TOOLS]['tool'][],
    toolChoice?: { type: "function", function: { name: string } },
    handlers?: StreamHandlers
  } = {}
) {
  const stream = await openai.chat.completions.create({
    messages,
    model: DEFAULT_MODEL,
    stream: true,
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
 * Formats search results into a context string
 */
export function formatSearchContext(results: TavilySearchResult[]): string {
  return results
    .map(result => `[Source: ${result.title}]\n${result.snippet}\n`)
    .join('\n');
}

/**
 * Creates messages array for the main chat completion
 */
export function createMainChatMessages(
  conversationHistory: ChatCompletionMessageParam[],
  query: string,
  searchContext: string | null,
  language: string
): ChatCompletionMessageParam[] {
  return [
    { 
      role: 'system', 
      content: `${SYSTEM_PROMPTS.MAIN_ASSISTANT(language)}\n\nIMPORTANT: You MUST respond ONLY in ${language}. This is a strict requirement - do not use any other language under any circumstances. If you cannot provide an answer in ${language}, respond with an error message in ${language}.${searchContext ? "\n\nUse the search results provided to enhance your responses, and always cite your sources when using information from them." : ""}`
    },
    ...conversationHistory,
    ...(searchContext ? [{
      role: 'user' as const,
      content: `Search Results:\n${searchContext}`
    }] : []),
    {
      role: 'user',
      content: query
    }
  ];
}

/**
 * Creates messages array for generating related questions
 */
export function createRelatedQuestionsMessages(
  conversationHistory: ChatCompletionMessageParam[],
  query: string,
  previousTopic: string | undefined,
  language: string
): ChatCompletionMessageParam[] {
  return [
    {
      role: 'system',
      content: `${SYSTEM_PROMPTS.RELATED_QUESTIONS(language)}\n\nIMPORTANT: You MUST generate all questions ONLY in ${language}. This is a strict requirement - do not use any other language under any circumstances.`
    },
    ...conversationHistory,
    {
      role: 'user',
      content: previousTopic 
        ? `Previous topic: ${previousTopic}\nNew question: ${query}`
        : query
    }
  ];
} 