import { MathAPI } from './services/api/math-api';

async function testMathTool() {
  const mathAPI = new MathAPI();
  
  console.log('\n=== Math Tool Test ===\n');

  try {
    // Test 1: Simple calculation
    console.log('Test 1: Simple calculation');
    await mathAPI.calculate('2 + 2', false);

    // Test 2: Complex calculation with steps
    console.log('\nTest 2: Complex calculation with steps');
    await mathAPI.calculate('2 * (3 + 4)', true);

    // Test 3: Error case
    console.log('\nTest 3: Error handling');
    await mathAPI.calculate('2 + abc', false);
  } catch (err) {
    const error = err as Error;
    console.log('Expected error caught:', error.message);
  }
}

// Run the test
testMathTool(); 