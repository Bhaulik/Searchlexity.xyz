import { ToolDefinition } from './tool-registry';

export const RELATED_QUESTIONS_TOOL: ToolDefinition = {
  name: "get_related_questions",
  description: "Get related follow-up questions based on conversation context",
  tool: {
    type: "function",
    function: {
      name: "get_related_questions",
      description: "Get related follow-up questions based on conversation context",
      parameters: {
        type: "object",
        properties: {
          questions: {
            type: "array",
            description: "Array of 5 contextually relevant follow-up questions",
            items: {
              type: "string"
            },
            minItems: 5,
            maxItems: 5
          }
        },
        required: ["questions"]
      }
    }
  }
}; 