import { createResearchGraph } from '../graph/research.graph';
import { ResearchState } from '../interfaces/state.interface';

async function testResearchGraphWithMultiTools() {
  console.log('🧪 Testing Research Graph with Multi-Tool System...\n');

  const graph = createResearchGraph((step, progress, details) => {
    console.log(`📊 ${step}: ${progress}% - ${details}`);
  });

  // Test 1: Financial query that should use multiple tools
  console.log('💰 Test 1: Financial Analysis Query');
  try {
    const initialState: ResearchState = {
      researchQuery: 'Tesla TSLA stock analysis and recent news 2024'
    };

    console.log('Starting research...');
    const result = await graph.invoke(initialState);

    console.log('\n📋 Results Summary:');
    console.log(`- Search Results: ${result.searchResults?.length || 0} items`);
    console.log(`- Financial Data: ${result.financialData?.length || 0} items`);
    console.log(`- News Data: ${result.newsData?.length || 0} items`);
    console.log(`- Gap Search Loops: ${result.findGapLoops || 0}`);
    
    if (result.finalDocument) {
      console.log(`- Final Document: ${result.finalDocument.length} characters`);
      console.log('\n📄 Document Preview:');
      console.log(result.finalDocument.substring(0, 300) + '...');
    }

    console.log('\n✅ Financial analysis test completed successfully');
  } catch (error) {
    console.log('❌ Financial analysis test failed:', error);
  }

  // Test 2: General query that should primarily use Tavily
  console.log('\n\n🔍 Test 2: General Research Query');
  try {
    const initialState: ResearchState = {
      researchQuery: 'artificial intelligence machine learning trends 2024'
    };

    console.log('Starting research...');
    const result = await graph.invoke(initialState);

    console.log('\n📋 Results Summary:');
    console.log(`- Search Results: ${result.searchResults?.length || 0} items`);
    console.log(`- Financial Data: ${result.financialData?.length || 0} items`);
    console.log(`- News Data: ${result.newsData?.length || 0} items`);
    console.log(`- Gap Search Loops: ${result.findGapLoops || 0}`);
    
    if (result.finalDocument) {
      console.log(`- Final Document: ${result.finalDocument.length} characters`);
    }

    console.log('\n✅ General research test completed successfully');
  } catch (error) {
    console.log('❌ General research test failed:', error);
  }

  console.log('\n🎉 Research Graph Multi-Tool testing completed!');
}

// Run the test
testResearchGraphWithMultiTools().catch(console.error); 