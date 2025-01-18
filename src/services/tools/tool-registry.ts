import type { ChatCompletionTool } from 'openai/resources/chat/completions';

export interface ToolDefinition {
  name: string;
  description: string;
  tool: ChatCompletionTool;
}

export interface ToolCategory {
  name: string;
  description: string;
  tools: Record<string, ToolDefinition>;
}

class ToolRegistry {
  private categories: Map<string, ToolCategory> = new Map();

  /**
   * Register a new tool category
   */
  registerCategory(categoryName: string, description: string): ToolCategory {
    console.debug('[Tool Registry] Registering category:', {
      category: categoryName,
      description
    });

    if (this.categories.has(categoryName)) {
      console.warn('[Tool Registry] Category already exists:', categoryName);
      throw new Error(`Category ${categoryName} already exists`);
    }

    const category: ToolCategory = {
      name: categoryName,
      description,
      tools: {}
    };

    this.categories.set(categoryName, category);
    console.info('[Tool Registry] Category registered:', categoryName);
    return category;
  }

  /**
   * Register a new tool in a category
   */
  registerTool(categoryName: string, tool: ToolDefinition): void {
    console.debug('[Tool Registry] Registering tool:', {
      category: categoryName,
      tool: tool.name
    });

    const category = this.categories.get(categoryName);
    if (!category) {
      console.error('[Tool Registry] Category not found:', categoryName);
      throw new Error(`Category ${categoryName} not found`);
    }

    if (category.tools[tool.name]) {
      console.warn('[Tool Registry] Tool already exists:', {
        category: categoryName,
        tool: tool.name
      });
      throw new Error(`Tool ${tool.name} already exists in category ${categoryName}`);
    }

    category.tools[tool.name] = tool;
    console.info('[Tool Registry] Tool registered:', {
      category: categoryName,
      tool: tool.name
    });
  }

  /**
   * Get all tools in a category
   */
  getToolsByCategory(categoryName: string): Record<string, ToolDefinition> {
    const category = this.categories.get(categoryName);
    if (!category) {
      console.warn('[Tool Registry] Attempted to access non-existent category:', categoryName);
      throw new Error(`Category ${categoryName} not found`);
    }
    return category.tools;
  }

  /**
   * Get a specific tool
   */
  getTool(categoryName: string, toolName: string): ToolDefinition {
    const category = this.categories.get(categoryName);
    if (!category) {
      console.warn('[Tool Registry] Attempted to access non-existent category:', categoryName);
      throw new Error(`Category ${categoryName} not found`);
    }

    const tool = category.tools[toolName];
    if (!tool) {
      console.warn('[Tool Registry] Tool not found:', {
        category: categoryName,
        tool: toolName
      });
      throw new Error(`Tool ${toolName} not found in category ${categoryName}`);
    }

    return tool;
  }

  /**
   * Get all tools flattened into a single record
   */
  getAllTools(): Record<string, ToolDefinition> {
    console.debug('[Tool Registry] Getting all registered tools');
    const allTools: Record<string, ToolDefinition> = {};
    
    for (const category of this.categories.values()) {
      Object.assign(allTools, category.tools);
    }
    
    return allTools;
  }

  /**
   * Get all categories
   */
  getCategories(): ToolCategory[] {
    return Array.from(this.categories.values());
  }
}

// Create and export singleton instance
export const toolRegistry = new ToolRegistry(); 