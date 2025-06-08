import { SearchPlannerBrain } from '../brains/SearchPlannerBrain';
import { ToolExecutor } from '../tools/ToolExecutor';
import { ResearchState } from '../interfaces/state.interface';

async function testMultiToolSystem() {
  console.log('🧪 Testing Multi-Tool System...\n');

  // Test 1: Search Planner with Financial Query
  console.log('📋 Test 1: Search Planner with Financial Query');
  const searchPlanner = new SearchPlannerBrain();
  
  const state: ResearchState = {
    researchQuery: 'Apple AAPL stock analysis and recent news 2024'
  };

  try {
    const planResult = await searchPlanner.invoke(state);
    console.log('✅ Search Plan Generated:');
    console.log(`- Tools: ${planResult.searchPlan?.tools.join(', ')}`);
    console.log(`- Queries:`, planResult.searchPlan?.queries);

    // Test 2: Execute the plan
    console.log('\n🚀 Test 2: Execute Tool Plan');
    const toolExecutor = new ToolExecutor();
    
    if (planResult.searchPlan) {
      const result = await toolExecutor.executeToolPlan(planResult.searchPlan, planResult);
      
      console.log('\n📊 Execution Results:');
      console.log(`- Search Results: ${result.searchResults?.length || 0} items`);
      console.log(`- Financial Data: ${result.financialData?.length || 0} items`);
      console.log(`- News Data: ${result.newsData?.length || 0} items`);

      if (result.financialData && result.financialData.length > 0) {
        console.log('\n💰 Financial Data Sample:');
        const sample = result.financialData[0];
        console.log(`- Symbol: ${sample.symbol}`);
        console.log(`- Company: ${sample.quote?.longName || sample.quote?.shortName}`);
        console.log(`- Price: $${sample.quote?.regularMarketPrice?.toFixed(2)}`);
      }

      if (result.newsData && result.newsData.length > 0) {
        console.log('\n📰 News Data Sample:');
        const sample = result.newsData[0];
        console.log(`- Articles: ${sample.articles?.length || 0}`);
        if (sample.articles && sample.articles.length > 0) {
          console.log(`- Latest: ${sample.articles[0].title}`);
        }
      }

      console.log('\n✅ Multi-tool system test completed successfully!');
    }
  } catch (error) {
    console.log('❌ Test failed:', error);
  }
}

// Run the test
testMultiToolSystem().catch(console.error); 