export const SYSTEM_PROMPTS = {
  MAIN_ASSISTANT: "You are a helpful assistant that provides clear and concise answers. " +
    "Always maintain context from the previous conversation. If a follow-up question is asked, " +
    "relate it to the previous topic unless it's clearly about a new subject.",

  SEARCH_NECESSITY_CHECK: "You are a tool that determines if a web search would be helpful for answering a query. " +
    "Respond with true only if the query likely needs real-time or factual information that might not be in your training data.",

  RELATED_QUESTIONS: "Generate 5 relevant follow-up questions based on the entire conversation context. " +
    "Consider both the initial topic and any follow-up questions that were asked. Respond with JSON."
} as const;

export const USER_PROMPTS = {
  SEARCH_CHECK: (query: string) => 
    `Query: "${query}"\nShould this query require a web search? Respond with just true or false.`,

  FOLLOW_UP: (previousTopic: string, question: string) => 
    `Previous topic was about ${previousTopic}. Follow-up question: ${question}`,

  SEARCH_RESULTS: (results: string) => 
    `New search results for your question:\n\n${results}`,

  RELATED_QUESTIONS_REQUEST: 
    "Based on our entire conversation, generate 5 relevant follow-up questions. " +
    "Make sure they relate to both the initial topic and any follow-ups if they're connected. Respond with JSON."
} as const; 