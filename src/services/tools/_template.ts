import { ToolDefinition } from './tool-registry';

/**
 * Template for creating a new tool.
 * 1. Copy this file
 * 2. Rename it to your-tool.ts
 * 3. Modify the configuration below
 * 4. Register it in service-manager.ts
 */

export const TEMPLATE_TOOL: ToolDefinition = {
  name: "tool_name", // Unique identifier for the tool
  description: "Brief description of what the tool does",
  tool: {
    type: "function",
    function: {
      name: "tool_name", // Same as above
      description: "Detailed description of the tool's functionality",
      parameters: {
        type: "object",
        properties: {
          // Define your parameters here
          param1: {
            type: "string",
            description: "Description of parameter 1"
          },
          param2: {
            type: "number",
            description: "Description of parameter 2"
          }
        },
        required: ["param1"] // List required parameters
      }
    }
  }
};

/**
 * If your tool needs an API, create a class like this:
 */
export class TemplateAPI {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async someMethod(param1: string, param2: number) {
    // Implement your API methods
    const response = await fetch(`your-endpoint/${param1}?value=${param2}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`
      }
    });
    return response.json();
  }
}

/**
 * If your tool needs types, define them like this:
 */
export interface TemplateResponse {
  data: {
    field1: string;
    field2: number;
  };
}

// ============================================================================
// Example 1: Weather Tool Implementation
// ============================================================================

// src/types/weather.ts
// export interface WeatherValues {
//   temperature: number;
//   humidity: number;
//   windSpeed: number;
//   precipitation: number;
// }

// export interface WeatherForecast {
//   data: {
//     timelines: {
//       hourly: Array<{
//         time: string;
//         values: WeatherValues;
//       }>;
//     };
//   };
//   location: {
//     lat: number;
//     lon: number;
//   };
// }

// // src/services/tools/weather-tool.ts
// export const WEATHER_TOOL: ToolDefinition = {
//   name: "get_weather_forecast",
//   description: "Get weather forecast for a location",
//   tool: {
//     type: "function",
//     function: {
//       name: "get_weather_forecast",
//       description: "Get weather forecast data for a specific location",
//       parameters: {
//         type: "object",
//         properties: {
//           latitude: {
//             type: "number",
//             description: "Location latitude"
//           },
//           longitude: {
//             type: "number",
//             description: "Location longitude"
//           }
//         },
//         required: ["latitude", "longitude"]
//       }
//     }
//   }
// };

// // src/services/api/weather-api.ts
// export class WeatherAPI {
//   private apiKey: string;
//   private baseUrl = 'https://api.tomorrow.io/v4/weather';

//   constructor(apiKey: string) {
//     this.apiKey = apiKey;
//   }

//   async getForecast(lat: number, lon: number): Promise<WeatherForecast> {
//     const response = await fetch(
//       `${this.baseUrl}/forecast?location=${lat},${lon}&apikey=${this.apiKey}`
//     );
//     if (!response.ok) {
//       throw new Error('Weather API error');
//     }
//     return response.json();
//   }
// }

// // ============================================================================
// // Example 2: Adding Anthropic as a New Model Provider
// // ============================================================================

// // src/services/api/anthropic-api.ts
// import Anthropic from '@anthropic-ai/sdk';
// import type { MessageParam } from '@anthropic-ai/sdk';

// export class AnthropicAPI {
//   private client: Anthropic;
//   private model: string;

//   constructor(apiKey: string, model = 'claude-3-opus-20240229') {
//     this.client = new Anthropic({ apiKey });
//     this.model = model;
//   }

//   async createChatCompletion(
//     messages: MessageParam[],
//     options: {
//       temperature?: number;
//       maxTokens?: number;
//       stream?: boolean;
//       tools?: any[];
//     } = {}
//   ) {
//     const response = await this.client.messages.create({
//       model: this.model,
//       messages,
//       temperature: options.temperature,
//       max_tokens: options.maxTokens,
//       stream: options.stream,
//       ...(options.tools && { tools: options.tools })
//     });

//     return response;
//   }
// }

// // Add to src/config/api-config.ts
// export const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;
// export const ENABLE_ANTHROPIC = Boolean(ANTHROPIC_API_KEY);

// // Update ServiceManager
// class ServiceManager {
//   private anthropicAPI?: AnthropicAPI;

//   constructor() {
//     // Initialize Anthropic if enabled
//     if (ENABLE_ANTHROPIC) {
//       this.anthropicAPI = new AnthropicAPI(ANTHROPIC_API_KEY!);
//     }
//   }

//   getAnthropicAPI(): AnthropicAPI | undefined {
//     return this.anthropicAPI;
//   }

//   hasAnthropicAPI(): boolean {
//     return Boolean(this.anthropicAPI);
//   }
// }

// // Usage in components:
// const anthropic = serviceManager.getAnthropicAPI();
// if (anthropic) {
//   const response = await anthropic.createChatCompletion([
//     { role: 'user', content: 'Hello!' }
//   ], {
//     temperature: 0.7,
//     maxTokens: 1000
//   });
// } 

// ============================================================================
// Example 3: Math Tool Implementation
// ============================================================================

// src/types/math.ts
// export interface MathResult {
//   result: number;
//   steps?: string[];
// }

// // src/services/tools/math-tool.ts
// export const MATH_TOOL: ToolDefinition = {
//   name: "calculate",
//   description: "Perform mathematical calculations with step-by-step explanations",
//   tool: {
//     type: "function",
//     function: {
//       name: "calculate",
//       description: "Calculate mathematical expressions and provide step-by-step solutions",
//       parameters: {
//         type: "object",
//         properties: {
//           expression: {
//             type: "string",
//             description: "Mathematical expression to evaluate (e.g., '2 * (3 + 4)')"
//           },
//           includeSteps: {
//             type: "boolean",
//             description: "Whether to include step-by-step solution",
//             default: false
//           }
//         },
//         required: ["expression"]
//       }
//     }
//   }
// };

// // src/services/api/math-api.ts
// export class MathAPI {
//   private evaluateExpression(expr: string): number {
//     // For security, we should use a proper math expression evaluator library
//     // This is just a simple example using Function
//     try {
//       // Basic sanitization
//       if (!/^[0-9+\-*/(). ]*$/.test(expr)) {
//         throw new Error('Invalid characters in expression');
//       }
//       return Function(`'use strict'; return (${expr})`)();
//     } catch (error) {
//       throw new Error(`Invalid mathematical expression: ${error.message}`);
//     }
//   }

//   private generateSteps(expr: string): string[] {
//     const steps: string[] = [];
    
//     // Example step generation for (2 * (3 + 4))
//     if (expr.includes('(')) {
//       const innerExpr = expr.match(/\(([^()]+)\)/)?.[1];
//       if (innerExpr) {
//         steps.push(`Evaluate inner expression: ${innerExpr}`);
//         const innerResult = this.evaluateExpression(innerExpr);
//         steps.push(`Inner result: ${innerResult}`);
        
//         const newExpr = expr.replace(/\([^()]+\)/, innerResult.toString());
//         steps.push(`Substitute back: ${newExpr}`);
//       }
//     }
    
//     const finalResult = this.evaluateExpression(expr);
//     steps.push(`Final result: ${finalResult}`);
    
//     return steps;
//   }

//   async calculate(expression: string, includeSteps = false): Promise<MathResult> {
//     const result = this.evaluateExpression(expression);
    
//     return {
//       result,
//       ...(includeSteps && { steps: this.generateSteps(expression) })
//     };
//   }
// }

// // Add to src/config/api-config.ts
// export const ENABLE_MATH = true; // Since this doesn't need an API key

// // Update ServiceManager
// class ServiceManager {
//   private mathAPI: MathAPI;

//   constructor() {
//     // Initialize Math API (always available)
//     this.mathAPI = new MathAPI();
//   }

//   getMathAPI(): MathAPI {
//     return this.mathAPI;
//   }
// }

// // Usage with OpenAI:
// // Add to src/services/service-manager.ts
// toolRegistry.registerCategory(
//   'math',
//   'Tools for performing mathematical calculations'
// );
// toolRegistry.registerTool('math', MATH_TOOL);

// Example conversation:
/*
User: What is 2 * (3 + 4)?
Assistant: Let me calculate that for you using the math tool.

const mathAPI = serviceManager.getMathAPI();
const result = await mathAPI.calculate('2 * (3 + 4)', true);

The calculation 2 * (3 + 4) equals ${result.result}

Here are the steps:
${result.steps.join('\n')}

So, 2 * (3 + 4) = 2 * 7 = 14
*/ 