# 🛠️ Open-Source Perplexity Alternative

A modern, extensible framework for building AI applications with seamless tool and LLM integration.
<img width="1511" alt="image" src="https://github.com/user-attachments/assets/15932897-a0f7-4f3b-bbfb-34b6d59399f5" />
<img width="1505" alt="image" src="https://github.com/user-attachments/assets/02ac33de-77e2-4bc2-86f5-6cec04051a63" />
<img width="1509" alt="image" src="https://github.com/user-attachments/assets/1f8e70f8-af0c-4967-98b5-bba1e31deb56" />

## 🚀 Quick Start

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Create a `.env` file with your API keys:
```bash
VITE_OPENAI_API_KEY=your_openai_key
VITE_TAVILY_API_KEY=your_tavily_key
```
4. Start the development server:
```bash
npm run dev
```

## 📚 Adding New Tools

Adding a new tool is easy! Here's a step-by-step guide:

### 1. Create Tool Types
```typescript
// src/types/my-tool.ts
export interface MyToolResult {
  data: string;
  metadata?: any;
}
```

### 2. Create Tool API Class
```typescript
// src/services/api/my-tool-api.ts
import type { MyToolResult } from '../../types/my-tool';

export class MyToolAPI {
  constructor() {
    console.info('[My Tool] Initialized');
  }

  async doSomething(input: string): Promise<MyToolResult> {
    console.group('[My Tool] Processing request');
    try {
      // Your tool logic here
      console.info('[My Tool] Request successful');
      return { data: 'result' };
    } catch (error) {
      console.error('[My Tool] Request failed:', error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }
}
```

### 3. Define Tool for LLM
```typescript
// src/services/tools/my-tool.ts
import { ToolDefinition } from './tool-registry';

export const MY_TOOL: ToolDefinition = {
  name: "my_tool_name",
  description: "What my tool does",
  tool: {
    type: "function",
    function: {
      name: "my_tool_name",
      description: "Detailed description for LLM",
      parameters: {
        type: "object",
        properties: {
          input: {
            type: "string",
            description: "Input description"
          }
        },
        required: ["input"]
      }
    }
  }
};
```

### 4. Register in Service Manager
```typescript
// src/services/service-manager.ts
import { MY_TOOL } from './tools/my-tool';
import { MyToolAPI } from './api/my-tool-api';

class ServiceManager {
  private myToolAPI: MyToolAPI;

  constructor() {
    // Initialize API
    this.myToolAPI = new MyToolAPI();

    // Register category
    toolRegistry.registerCategory(
      'my_category',
      'Description of category'
    );

    // Register tool
    toolRegistry.registerTool('my_category', MY_TOOL);
  }

  getMyToolAPI(): MyToolAPI {
    return this.myToolAPI;
  }
}
```

## 🔌 Connecting to LLMs

The framework supports multiple LLM providers. Here's how to add a new one:

### 1. Create LLM API Class
```typescript
// src/services/api/my-llm-api.ts
export class MyLLMAPI {
  constructor(apiKey: string) {
    this.client = new MyLLMClient(apiKey);
  }

  async createChatCompletion(messages: any[], options = {}) {
    // Implementation
  }
}
```

### 2. Add Configuration
```typescript
// src/config/api-config.ts
export const MY_LLM_API_KEY = import.meta.env.VITE_MY_LLM_API_KEY;
export const ENABLE_MY_LLM = Boolean(MY_LLM_API_KEY);
```

### 3. Register in Service Manager
```typescript
class ServiceManager {
  private myLLMAPI?: MyLLMAPI;

  constructor() {
    if (ENABLE_MY_LLM) {
      this.myLLMAPI = new MyLLMAPI(MY_LLM_API_KEY!);
    }
  }

  getMyLLMAPI() {
    return this.myLLMAPI;
  }
}
```

## 🎯 Tool Categories

Tools are organized into categories for better management:

- `conversation`: Chat and context management tools
- `math`: Mathematical calculation tools
- Add your categories here!

## 📝 Logging Best Practices

For consistent logging across tools:

1. Use the tool name prefix: `[My Tool]`
2. Use console groups for requests
3. Log initialization, success, and errors
4. Use emojis for better visibility

Example:
```typescript
console.group('[My Tool] 🔄 Processing request');
console.info('[My Tool] Input:', data);
console.info('[My Tool] ✅ Success:', result);
console.error('[My Tool] ❌ Error:', error);
console.groupEnd();
```

## 🧪 Testing Tools

Test your tools using the provided template:

```typescript
// src/test-my-tool.ts
import { MyToolAPI } from './services/api/my-tool-api';

async function testMyTool() {
  const myTool = new MyToolAPI();
  
  try {
    const result = await myTool.doSomething('test input');
    console.log('Test result:', result);
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testMyTool();
```

Run the test:
```bash
npx tsx src/test-my-tool.ts
```

## 🔑 Environment Variables

Required variables:
```bash
# Core APIs
VITE_OPENAI_API_KEY=your_openai_key
VITE_TAVILY_API_KEY=your_tavily_key

# Optional APIs
VITE_MY_LLM_API_KEY=your_api_key
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Follow the tool/LLM integration guides above
4. Add tests for your changes
5. Submit a pull request

## 📖 Additional Resources

- [OpenAI Function Calling Guide](https://platform.openai.com/docs/guides/function-calling)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev/guide/)

## 🆘 Troubleshooting

Common issues and solutions:

1. **Tool logs not showing**
   - Ensure your tool uses the logging format above
   - Check that the tool is properly registered
   - Verify the LLM is actually using the tool

2. **LLM not using tools**
   - Check tool registration
   - Verify tool schema matches OpenAI's format
   - Make sure tool description is clear for the LLM

3. **API Key Issues**
   - Check `.env` file exists
   - Verify key format
   - Ensure key is properly exported in `api-config.ts`

## 📄 License

MIT License - feel free to use this framework in your projects! 

## 💡 Complete Example: Calculator Tool

Let's walk through creating a calculator tool that the LLM can use for mathematical operations.

### 1. Create Types
```typescript
// src/types/calculator.ts
export interface CalculatorResult {
  result: number;
  steps?: string[];
}
```

### 2. Create API Class
```typescript
// src/services/api/calculator-api.ts
import type { CalculatorResult } from '../../types/calculator';

export class CalculatorAPI {
  constructor() {
    console.info('[Calculator] Initialized and ready');
  }

  async calculate(expression: string, showSteps = false): Promise<CalculatorResult> {
    console.group('[Calculator] 🧮 Processing calculation');
    console.info('[Calculator] Input:', { expression, showSteps });

    try {
      // Basic validation
      if (!/^[0-9+\-*/(). ]*$/.test(expression)) {
        throw new Error('Invalid characters in expression');
      }

      // Evaluate expression
      const result = Function(`'use strict'; return (${expression})`)();
      
      console.info('[Calculator] ✅ Calculation successful:', result);
      console.groupEnd();

      return {
        result,
        ...(showSteps && {
          steps: [
            `Received expression: ${expression}`,
            `Evaluated result: ${result}`
          ]
        })
      };
    } catch (error) {
      console.error('[Calculator] ❌ Calculation failed:', error);
      console.groupEnd();
      throw error;
    }
  }
}
```

### 3. Define Tool for LLM
```typescript
// src/services/tools/calculator-tool.ts
import { ToolDefinition } from './tool-registry';

export const CALCULATOR_TOOL: ToolDefinition = {
  name: "calculate",
  description: "Perform mathematical calculations",
  tool: {
    type: "function",
    function: {
      name: "calculate",
      description: "Calculate the result of a mathematical expression",
      parameters: {
        type: "object",
        properties: {
          expression: {
            type: "string",
            description: "Mathematical expression to evaluate (e.g., '2 * (3 + 4)')"
          },
          showSteps: {
            type: "boolean",
            description: "Whether to show calculation steps",
            default: false
          }
        },
        required: ["expression"]
      }
    }
  }
};
```

### 4. Register in Service Manager
```typescript
// src/services/service-manager.ts
import { CALCULATOR_TOOL } from './tools/calculator-tool';
import { CalculatorAPI } from './api/calculator-api';

class ServiceManager {
  private calculatorAPI: CalculatorAPI;

  constructor() {
    // Initialize API
    this.calculatorAPI = new CalculatorAPI();

    // Register category
    toolRegistry.registerCategory(
      'math',
      'Mathematical calculation tools'
    );

    // Register tool
    toolRegistry.registerTool('math', CALCULATOR_TOOL);
  }

  getCalculatorAPI(): CalculatorAPI {
    return this.calculatorAPI;
  }
}
```

### 5. Test the Tool
```typescript
// src/test-calculator.ts
import { CalculatorAPI } from './services/api/calculator-api';

async function testCalculator() {
  const calculator = new CalculatorAPI();
  
  try {
    // Test simple calculation
    const result1 = await calculator.calculate('2 + 2');
    console.log('Simple calculation:', result1);
    // Output: { result: 4 }

    // Test complex calculation with steps
    const result2 = await calculator.calculate('2 * (3 + 4)', true);
    console.log('Complex calculation:', result2);
    // Output: { 
    //   result: 14,
    //   steps: [
    //     "Received expression: 2 * (3 + 4)",
    //     "Evaluated result: 14"
    //   ]
    // }

    // Test error handling
    await calculator.calculate('2 + abc');
  } catch (error) {
    console.error('Error test:', error.message);
  }
}

testCalculator();
```

### 6. Use with LLM
```typescript
// Example conversation with OpenAI
const messages = [
  { role: 'system', content: 'You are a helpful assistant that can perform calculations.' },
  { role: 'user', content: 'What is 2 * (3 + 4)?' }
];

const openai = serviceManager.getOpenAIAPI();
const response = await openai.createChatCompletion(messages, {
  tools: [CALCULATOR_TOOL],
  tool_choice: { type: "function", function: { name: "calculate" } }
});

// LLM will use the calculator tool and respond with something like:
// "Let me calculate that for you. 2 * (3 + 4) = 14"
```

### 7. Console Output
When the LLM uses the calculator tool, you'll see logs like this:
```
[Calculator] Initialized and ready
[Calculator] 🧮 Processing calculation
  [Calculator] Input: { expression: "2 * (3 + 4)", showSteps: true }
  [Calculator] ✅ Calculation successful: 14
```

### 8. Error Handling
The tool includes built-in error handling:
```typescript
try {
  await calculator.calculate('2 + abc');
} catch (error) {
  // Will log:
  // [Calculator] ❌ Calculation failed: Invalid characters in expression
}
```

This example demonstrates:
- Proper TypeScript types
- Consistent logging format
- Error handling
- LLM integration
- Testing approach
- Input validation
- Step-by-step output option

## 🏗️ Architecture Overview

```
┌─────────────────┐     ┌──────────────┐     ┌────────────────┐
│     LLM API     │     │ Tool Registry│     │    Tools       │
│  (OpenAI, etc.) │────▶│  Categories  │────▶│ - Calculator   │
└─────────────────┘     │    Tools     │     │ - Weather      │
                        └──────────────┘     │ - Search       │
                              ▲             └────────────────┘
                              │                     ▲
                        ┌──────────────┐           │
                        │   Service    │           │
                        │   Manager    │───────────┘
                        └──────────────┘
```

## 🔄 Tool Lifecycle

1. **Initialization**
   ```typescript
   // Tool is created and registered
   toolRegistry.registerTool('category', TOOL);
   ```

2. **LLM Request**
   ```typescript
   // LLM receives user input
   "Calculate 2 + 2"
   ```

3. **Tool Selection**
   ```typescript
   // LLM identifies appropriate tool
   tool_choice: { type: "function", name: "calculate" }
   ```

4. **Execution**
   ```typescript
   // Tool processes request
   const result = await calculatorAPI.calculate('2 + 2');
   ```

5. **Response**
   ```typescript
   // Result returned to user
   "The result is 4"
   ```

## 🎨 Styling and UI Integration

If you're building a UI for your tools:

```typescript
// src/components/ToolDisplay.tsx
import { useEffect, useState } from 'react';
import { serviceManager } from '../services/service-manager';

export function ToolDisplay() {
  const [result, setResult] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCalculation() {
    setLoading(true);
    try {
      const calculator = serviceManager.getCalculatorAPI();
      const result = await calculator.calculate('2 + 2');
      setResult(result.result);
    } catch (error) {
      console.error('Calculation failed:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="tool-display">
      {loading ? (
        <div className="loading">Calculating...</div>
      ) : (
        <div className="result">Result: {result}</div>
      )}
    </div>
  );
}
```

## 🔒 Security Best Practices

1. **Input Validation**
   ```typescript
   // Always validate user input
   if (!/^[0-9+\-*/(). ]*$/.test(userInput)) {
     throw new Error('Invalid input');
   }
   ```

2. **API Key Management**
   ```typescript
   // Use environment variables
   const apiKey = import.meta.env.VITE_API_KEY;
   if (!apiKey) {
     throw new Error('API key not configured');
   }
   ```

3. **Error Boundaries**
   ```typescript
   // Implement error boundaries in React
   class ToolErrorBoundary extends React.Component {
     // Error handling implementation
   }
   ```

## 📊 Performance Monitoring

Add performance monitoring to your tools:

```typescript
class PerformanceMonitor {
  private static timers: Map<string, number> = new Map();

  static start(operation: string) {
    this.timers.set(operation, performance.now());
  }

  static end(operation: string) {
    const start = this.timers.get(operation);
    if (start) {
      const duration = performance.now() - start;
      console.info(`[Performance] ${operation}: ${duration.toFixed(2)}ms`);
      this.timers.delete(operation);
    }
  }
}

// Usage in tools
async calculate(expression: string): Promise<Result> {
  PerformanceMonitor.start('calculation');
  // ... calculation logic
  PerformanceMonitor.end('calculation');
}
```

## 🔍 Debugging Tools

### Debug Mode
```typescript
// src/config/debug-config.ts
export const DEBUG_MODE = import.meta.env.VITE_DEBUG_MODE === 'true';

// Usage in tools
if (DEBUG_MODE) {
  console.debug('[Tool] Debug info:', {
    input,
    state,
    config
  });
}
```

### Tool Inspector
```typescript
// src/utils/tool-inspector.ts
export function inspectTool(toolName: string) {
  const registry = serviceManager.getToolRegistry();
  const tools = registry.getAllTools();
  
  console.group(`🔍 Tool Inspection: ${toolName}`);
  console.log('Configuration:', tools[toolName]);
  console.log('Category:', registry.getToolCategory(toolName));
  console.groupEnd();
}
```

## 📱 Mobile Considerations

1. **Responsive Logging**
   ```typescript
   // Adjust logging for mobile
   const isMobile = window.innerWidth < 768;
   if (isMobile) {
     console.log('[Tool] Mobile-friendly output:', result);
   }
   ```

2. **Performance Optimization**
   ```typescript
   // Implement lazy loading for tools
   const loadTool = async () => {
     const { MyTool } = await import('./tools/my-tool');
     return new MyTool();
   };
   ```

## 🌐 Internationalization

Support for multiple languages:

```typescript
// src/i18n/tool-messages.ts
const messages = {
  en: {
    calculator: {
      success: 'Calculation successful',
      error: 'Calculation failed'
    }
  },
  es: {
    calculator: {
      success: 'Cálculo exitoso',
      error: 'Error de cálculo'
    }
  }
};

// Usage in tools
console.info(`[Calculator] ${messages[lang].calculator.success}`);
```

## 🧩 Plugin System

Extend functionality with plugins:

```typescript
// src/plugins/plugin-registry.ts
interface Plugin {
  name: string;
  onToolExecution?: (result: any) => void;
  onError?: (error: Error) => void;
}

class PluginRegistry {
  private plugins: Plugin[] = [];

  register(plugin: Plugin) {
    this.plugins.push(plugin);
    console.info(`[Plugins] Registered: ${plugin.name}`);
  }

  notifyToolExecution(result: any) {
    this.plugins.forEach(p => p.onToolExecution?.(result));
  }
}
```

## 📈 Analytics Integration

Track tool usage:

```typescript
// src/analytics/tool-analytics.ts
class ToolAnalytics {
  static trackExecution(tool: string, success: boolean) {
    const data = {
      tool,
      success,
      timestamp: new Date().toISOString()
    };
    
    // Send to your analytics service
    console.info('[Analytics] Tool execution:', data);
  }
}

// Usage in tools
try {
  const result = await calculate(expression);
  ToolAnalytics.trackExecution('calculator', true);
  return result;
} catch (error) {
  ToolAnalytics.trackExecution('calculator', false);
  throw error;
}
```

## 🎮 Advanced Usage

### Chaining Tools
```typescript
async function chainTools() {
  // First tool generates data
  const data = await toolA.generate();
  
  // Second tool processes it
  const processed = await toolB.process(data);
  
  // Third tool formats the result
  return toolC.format(processed);
}
```

### Parallel Execution
```typescript
async function parallelTools() {
  const results = await Promise.all([
    toolA.execute(),
    toolB.execute(),
    toolC.execute()
  ]);
  return results;
}
```

### Tool Composition
```typescript
class CompositeCalculator {
  async calculateWithSteps(expression: string) {
    const basic = await calculator.calculate(expression);
    const formatted = await formatter.format(basic.result);
    return {
      ...basic,
      formatted
    };
  }
}
```

## 🎓 Best Practices Summary

1. **Tool Design**
   - Keep tools focused and single-purpose
   - Implement proper error handling
   - Use TypeScript for type safety
   - Follow consistent logging patterns

2. **Performance**
   - Implement caching where appropriate
   - Monitor execution times
   - Optimize for mobile devices
   - Use lazy loading for large tools

3. **Security**
   - Validate all inputs
   - Sanitize outputs
   - Protect API keys
   - Implement rate limiting

4. **Maintenance**
   - Write comprehensive tests
   - Document all tools
   - Monitor analytics
   - Keep dependencies updated

## 🔮 Future Enhancements

1. **Planned Features**
   - WebSocket support for real-time tools
   - Tool composition framework
   - Advanced caching system
   - Performance monitoring dashboard

2. **Community Tools**
   - Tool marketplace
   - Community contributions
   - Tool ratings and reviews
   - Usage statistics

## 🤝 Support

Need help? Here are your options:

1. **Documentation**
   - This README
   - Code comments
   - Type definitions

2. **Community**
   - GitHub Issues
   - Discussion Forums
   - Stack Overflow

3. **Contributing**
   - Bug reports
   - Feature requests
   - Pull requests
   - Documentation improvements

## 📜 Changelog

### Version 1.0.0
- Initial release
- Basic tool framework
- Calculator example
- Documentation

### Version 1.1.0 (Planned)
- WebSocket support
- Tool composition
- Analytics dashboard
- Mobile optimizations

## 📄 License

MIT License

Copyright (c) 2024

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software. 

## 🤖 Agents

The framework supports building custom agents that can orchestrate multiple tools and provide step-by-step feedback on their progress.

### Creating a Custom Agent

```typescript
// src/agents/custom-agent.ts
export class CustomAgent {
  private tools: Record<string, any>;
  private steps: AgentStep[] = [];

  constructor(tools: Record<string, any>) {
    this.tools = tools;
  }

  async process(
    query: string,
    history: Array<{ role: 'user' | 'assistant'; content: string }>,
    onStepsUpdate?: (steps: AgentStep[]) => void
  ): Promise<AgentResult> {
    // Initialize steps
    this.steps = [{
      id: 1,
      description: "Planning the response",
      requires_search: false,
      requires_tools: [],
      status: 'loading'
    }];
    onStepsUpdate?.(this.steps);

    try {
      // Execute steps and update progress
      const result = await this.executeSteps(query);
      return {
        answer: result.answer,
        sources: result.sources,
        steps: this.steps
      };
    } catch (error) {
      // Handle errors and update step status
      this.handleError(error);
      throw error;
    }
  }
}
```

### Agent Features

1. **Step-by-Step Progress**
   - Real-time updates on agent progress
   - Visual feedback for each step
   - Error handling and status tracking

2. **Tool Orchestration**
   - Dynamically select and use appropriate tools
   - Chain multiple tools together
   - Handle tool dependencies

3. **State Management**
   - Track conversation history
   - Maintain context between steps
   - Handle intermediate results

### Example Usage

```typescript
const agent = new CustomAgent({
  search: searchAPI,
  calculator: calculatorAPI,
  weather: weatherAPI
});

// Process a query with progress updates
const result = await agent.process(
  "What's the weather like and how does it affect solar panel efficiency?",
  previousMessages,
  (steps) => {
    // Update UI with current progress
    updateProgressUI(steps);
  }
);
```

### Agent Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌────────────────┐
│     Agent       │     │    Tools     │     │    Services    │
│  Orchestrator   │────▶│  Registry    │────▶│  - Search      │
└─────────────────┘     └──────────────┘     │  - Calculator  │
         │                                    │  - Weather     │
         │                                    └────────────────┘
         ▼
┌─────────────────┐
│     Steps       │
│  - Planning     │
│  - Research     │
│  - Tool Usage   │
│  - Response     │
└─────────────────┘
```

### Pro Mode Features

The framework includes a "Pro Mode" that enables advanced agent capabilities:

1. **Enhanced Planning**
   - Multi-step reasoning
   - Tool selection optimization
   - Context-aware processing

2. **Advanced Tool Usage**
   - Parallel tool execution
   - Tool result synthesis
   - Error recovery strategies

3. **Detailed Progress**
   - Step-by-step explanations
   - Tool usage tracking
   - Source attribution

## 🛠️ Tool Examples

### Basic Calculator


### Weather Tool
The framework includes a weather tool that demonstrates integration with the Open-Meteo API:

```typescript
const weatherAPI = new WeatherAPI();

// Get current weather
const weather = await weatherAPI.getWeather(52.52, 13.41);
console.log(`Temperature: ${weather.current.temperature}°C`);

// Get weather with forecast
const forecast = await weatherAPI.getWeather(52.52, 13.41, true);
console.log(`Temperature range: ${forecast.forecast.temperature.min}°C to ${forecast.forecast.temperature.max}°C`);
```

Features:
- Current weather conditions
- Hourly forecasts
- Temperature, humidity, and wind speed data
- Statistical analysis of forecast data
- No API key required
``` 
</rewritten_file> 
