import { createResearchGraph } from '../graph/research.graph';
import { ResearchState } from '../interfaces/state.interface';

async function testFinalIntegration() {
  console.log('🎯 Final Integration Test - Multi-Tool Research System\n');

  const graph = createResearchGraph((step, progress, details) => {
    console.log(`📊 ${step}: ${progress}% - ${details}`);
  });

  try {
    const initialState: ResearchState = {
      researchQuery: 'Apple AAPL stock price today'
    };

    console.log('🚀 Starting complete research workflow...\n');
    const startTime = Date.now();
    
    const result = await graph.invoke(initialState);
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('\n🎉 Research Completed Successfully!');
    console.log('=====================================');
    console.log(`⏱️  Duration: ${duration} seconds`);
    console.log(`🔍 Search Results: ${result.searchResults?.length || 0} items`);
    console.log(`💰 Financial Data: ${result.financialData?.length || 0} items`);
    console.log(`📰 News Data: ${result.newsData?.length || 0} items`);
    console.log(`🔄 Gap Search Loops: ${result.findGapLoops || 0}`);
    
    if (result.searchPlan) {
      console.log(`🛠️  Tools Used: ${result.searchPlan.tools.join(', ')}`);
    }

    if (result.finalDocument) {
      console.log(`📄 Final Document: ${result.finalDocument.length} characters`);
      console.log('\n📖 Document Preview:');
      console.log('─'.repeat(50));
      console.log(result.finalDocument.substring(0, 400) + '...');
      console.log('─'.repeat(50));
    }

    // Verify we got data from multiple sources
    const hasFinancialData = (result.financialData?.length || 0) > 0;
    const hasNewsData = (result.newsData?.length || 0) > 0;
    const hasSearchResults = (result.searchResults?.length || 0) > 0;
    const hasDocument = !!result.finalDocument;

    console.log('\n✅ System Verification:');
    console.log(`   Financial Data: ${hasFinancialData ? '✅' : '❌'}`);
    console.log(`   News Data: ${hasNewsData ? '✅' : '❌'}`);
    console.log(`   Search Results: ${hasSearchResults ? '✅' : '❌'}`);
    console.log(`   Final Document: ${hasDocument ? '✅' : '❌'}`);

    if (hasFinancialData && hasNewsData && hasSearchResults && hasDocument) {
      console.log('\n🎊 ALL SYSTEMS WORKING PERFECTLY! 🎊');
    } else {
      console.log('\n⚠️  Some components may need attention');
    }

  } catch (error) {
    console.log('❌ Integration test failed:', error);
  }
}

// Run the test
testFinalIntegration().catch(console.error); 