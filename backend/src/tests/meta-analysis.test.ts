import { createResearchGraph } from '../graph/research.graph';
import { ResearchState } from '../interfaces/state.interface';
import logger from '../utils/logger';

async function testMetaAnalysis() {
  console.log('🧪 Testing Meta Analysis with Error Handling...\n');

  const initialState: ResearchState = {
    researchQuery: 'Meta market trends'
  };

  let currentStep = '';
  let currentProgress = 0;

  const graph = createResearchGraph((step, progress, details) => {
    currentStep = step;
    currentProgress = progress;
    console.log(`📊 Step: ${step} (${progress}%) - ${details}`);
  });

  try {
    console.log('🚀 Starting Meta analysis...\n');
    
    const result = await graph.invoke(initialState);
    
    console.log('\n✅ Analysis completed successfully!');
    console.log(`Final document length: ${result.finalDocument?.length || 0} characters`);
    
    if (result.finalDocument) {
      console.log('\n📄 Document preview:');
      console.log(result.finalDocument.substring(0, 500) + '...');
    }

    console.log('\n📊 Final state:');
    console.log(`- Search results: ${result.searchResults?.length || 0}`);
    console.log(`- Financial data: ${result.financialData?.length || 0}`);
    console.log(`- News data: ${result.newsData?.length || 0}`);
    console.log(`- Gap loops: ${result.findGapLoops || 0}`);

  } catch (error) {
    console.error('\n❌ Analysis failed:');
    console.error(`Current step: ${currentStep}`);
    console.error(`Progress: ${currentProgress}%`);
    console.error('Error:', error);
    
    if (error instanceof Error) {
      console.error('Stack:', error.stack);
    }
  }
}

// Run the test
testMetaAnalysis(); 