import { createResearchGraph } from '../graph/research.graph';
import { ResearchState } from '../interfaces/state.interface';
import logger from '../utils/logger';

async function testRecursionFix() {
  console.log('🧪 Testing Recursion Fix...\n');

  const initialState: ResearchState = {
    researchQuery: 'Google stock analysis'
  };

  let stepCount = 0;
  let lastStep = '';
  const stepHistory: string[] = [];

  const graph = createResearchGraph((step, progress, details) => {
    stepCount++;
    lastStep = step;
    stepHistory.push(`${stepCount}: ${step} (${progress}%)`);
    console.log(`📊 Step ${stepCount}: ${step} (${progress}%) - ${details}`);
    
    // Safety check - if we get too many steps, something is wrong
    if (stepCount > 20) {
      console.error('❌ Too many steps detected, possible infinite loop!');
      throw new Error('Test safety limit reached');
    }
  });

  const startTime = Date.now();

  try {
    console.log('🚀 Starting analysis with recursion protection...\n');
    
    const result = await graph.invoke(initialState);
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log('\n✅ Analysis completed successfully!');
    console.log(`⏱️  Duration: ${duration.toFixed(2)} seconds`);
    console.log(`🔄 Total steps: ${stepCount}`);
    console.log(`📄 Final document length: ${result.finalDocument?.length || 0} characters`);
    
    console.log('\n📊 Step History:');
    stepHistory.forEach(step => console.log(`  ${step}`));
    
    console.log('\n📈 Final State Summary:');
    console.log(`- Search results: ${result.searchResults?.length || 0}`);
    console.log(`- Financial data: ${result.financialData?.length || 0}`);
    console.log(`- News data: ${result.newsData?.length || 0}`);
    console.log(`- Gap loops: ${result.findGapLoops || 0}`);
    console.log(`- Has final document: ${!!result.finalDocument}`);

    // Validate that we didn't get stuck in a loop
    if (stepCount <= 15) {
      console.log('\n✅ Recursion test PASSED - Normal step count');
    } else {
      console.log('\n⚠️  High step count but completed successfully');
    }

    if (result.finalDocument && result.finalDocument.length > 1000) {
      console.log('✅ Content generation test PASSED - Substantial content generated');
    } else {
      console.log('⚠️  Content generation test - Limited content');
    }

  } catch (error) {
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.error('\n❌ Analysis failed:');
    console.error(`⏱️  Duration before failure: ${duration.toFixed(2)} seconds`);
    console.error(`🔄 Steps completed: ${stepCount}`);
    console.error(`📍 Last step: ${lastStep}`);
    console.error('Error:', error);
    
    console.log('\n📊 Step History before failure:');
    stepHistory.forEach(step => console.log(`  ${step}`));
    
    if (error instanceof Error && error.message.includes('Recursion limit')) {
      console.error('\n🔄 RECURSION LIMIT ERROR - This indicates the fix may not be working properly');
    }
  }
}

// Run the test
testRecursionFix(); 