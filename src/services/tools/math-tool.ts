import { ToolDefinition } from './tool-registry';

export const MATH_TOOL: ToolDefinition = {
  name: "calculate",
  description: "Perform mathematical calculations with step-by-step explanations",
  tool: {
    type: "function",
    function: {
      name: "calculate",
      description: "Calculate mathematical expressions and provide step-by-step solutions",
      parameters: {
        type: "object",
        properties: {
          expression: {
            type: "string",
            description: "Mathematical expression to evaluate (e.g., '2 * (3 + 4)')"
          },
          includeSteps: {
            type: "boolean",
            description: "Whether to include step-by-step solution",
            default: false
          }
        },
        required: ["expression"]
      }
    }
  }
}; 