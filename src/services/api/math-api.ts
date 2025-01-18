import type { MathResult } from '../../types/math';

export class MathAPI {
  constructor() {
    console.info('[Math Tool] Initialized and ready for calculations');
  }

  // Static test method to verify logging
  static async test() {
    console.log('🧪 Testing Math Tool...');
    const mathAPI = new MathAPI();
    
    try {
      // Test simple calculation
      console.log('\n📋 Test 1: Simple calculation');
      await mathAPI.calculate('2 + 2', false);

      // Test with steps
      console.log('\n📋 Test 2: Complex calculation with steps');
      await mathAPI.calculate('2 * (3 + 4)', true);

      // Test error case
      console.log('\n📋 Test 3: Error handling');
      await mathAPI.calculate('2 + abc', false);
    } catch (err) {
      const error = err as Error;
      console.log('Expected error caught:', error.message);
    }
  }

  private evaluateExpression(expr: string): number {
    // For security, we should use a proper math expression evaluator library
    // This is just a simple example using Function
    try {
      console.debug('[Math Tool] Evaluating expression:', expr);
      
      // Basic sanitization
      if (!/^[0-9+\-*/(). ]*$/.test(expr)) {
        console.warn('[Math Tool] ⚠️ Invalid characters detected in expression:', expr);
        throw new Error('Invalid characters in expression');
      }
      const result = Function(`'use strict'; return (${expr})`)();
      console.debug('[Math Tool] Expression result:', result);
      return result;
    } catch (err) {
      const error = err as Error;
      console.error('[Math Tool] ❌ Expression evaluation failed:', error.message);
      throw new Error(`Invalid mathematical expression: ${error.message}`);
    }
  }

  private generateSteps(expr: string): string[] {
    console.debug('[Math Tool] 📝 Generating solution steps for:', expr);
    const steps: string[] = [];
    
    // Example step generation for (2 * (3 + 4))
    if (expr.includes('(')) {
      const innerExpr = expr.match(/\(([^()]+)\)/)?.[1];
      if (innerExpr) {
        console.debug('[Math Tool] Step 1: Found inner expression:', innerExpr);
        steps.push(`Evaluate inner expression: ${innerExpr}`);
        
        const innerResult = this.evaluateExpression(innerExpr);
        console.debug('[Math Tool] Step 2: Inner result:', innerResult);
        steps.push(`Inner result: ${innerResult}`);
        
        const newExpr = expr.replace(/\([^()]+\)/, innerResult.toString());
        console.debug('[Math Tool] Step 3: New expression:', newExpr);
        steps.push(`Substitute back: ${newExpr}`);
      }
    }
    
    const finalResult = this.evaluateExpression(expr);
    console.debug('[Math Tool] Final step: Result =', finalResult);
    steps.push(`Final result: ${finalResult}`);
    
    return steps;
  }

  async calculate(expression: string, includeSteps = false): Promise<MathResult> {
    console.group('[Math Tool] 🧮 Processing calculation request');
    console.info('[Math Tool] Input:', {
      expression,
      includeSteps,
      requestedBy: 'LLM'
    });

    try {
      const result = this.evaluateExpression(expression);
      const steps = includeSteps ? this.generateSteps(expression) : undefined;
      
      console.info('[Math Tool] ✅ Calculation successful:', {
        expression,
        result,
        hasSteps: Boolean(steps)
      });

      if (steps) {
        console.info('[Math Tool] Solution steps:', steps);
      }

      console.groupEnd();
      return {
        result,
        ...(includeSteps && { steps })
      };
    } catch (error) {
      console.error('[Math Tool] ❌ Calculation failed:', error);
      console.groupEnd();
      throw error;
    }
  }
} 