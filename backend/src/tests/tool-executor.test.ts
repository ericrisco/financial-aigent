import { ToolExecutor } from '../tools/ToolExecutor';
import { ResearchState, ToolPlan } from '../interfaces/state.interface';

async function testToolExecutor() {
  console.log('🧪 Testing ToolExecutor...\n');

  const toolExecutor = new ToolExecutor();

  // Test 1: Execute Tavily tool only
  console.log('📝 Test 1: Execute Tavily tool only');
  try {
    const toolPlan: ToolPlan = {
      tools: ['TAVILY'],
      queries: {
        'TAVILY': 'artificial intelligence trends 2024'
      }
    };

    const state: ResearchState = {
      researchQuery: 'AI trends',
      searchPlan: toolPlan
    };

    const result = await toolExecutor.executeToolPlan(toolPlan, state);

    if (result.searchResults && result.searchResults.length > 0) {
      console.log(`✅ Tavily results: ${result.searchResults.length} items`);
    } else {
      console.log('❌ No Tavily results found');
    }
  } catch (error) {
    console.log('❌ Tavily test failed:', error);
  }

  // Test 2: Execute Yahoo Finance tool only
  console.log('\n📈 Test 2: Execute Yahoo Finance tool only');
  try {
    const toolPlan: ToolPlan = {
      tools: ['YAHOO_FINANCE'],
      queries: {
        'YAHOO_FINANCE': 'AAPL MSFT stock analysis'
      }
    };

    const state: ResearchState = {
      researchQuery: 'Apple Microsoft stock analysis',
      searchPlan: toolPlan
    };

    const result = await toolExecutor.executeToolPlan(toolPlan, state);

    if (result.financialData && result.financialData.length > 0) {
      console.log(`✅ Financial data: ${result.financialData.length} items`);
    } else {
      console.log('❌ No financial data found');
    }

    if (result.searchResults && result.searchResults.length > 0) {
      console.log(`✅ Search results: ${result.searchResults.length} items`);
    } else {
      console.log('❌ No search results found');
    }
  } catch (error) {
    console.log('❌ Yahoo Finance test failed:', error);
  }

  // Test 3: Execute multiple tools in parallel
  console.log('\n🚀 Test 3: Execute multiple tools in parallel');
  try {
    const toolPlan: ToolPlan = {
      tools: ['TAVILY', 'YAHOO_FINANCE', 'NEWSDATA'],
      queries: {
        'TAVILY': 'Tesla company analysis 2024',
        'YAHOO_FINANCE': 'TSLA stock performance',
        'NEWSDATA': 'Tesla latest news developments'
      }
    };

    const state: ResearchState = {
      researchQuery: 'Tesla comprehensive analysis',
      searchPlan: toolPlan
    };

    const result = await toolExecutor.executeToolPlan(toolPlan, state);

    console.log(`📊 Total search results: ${result.searchResults?.length || 0}`);
    console.log(`💰 Financial data items: ${result.financialData?.length || 0}`);
    console.log(`📰 News data items: ${result.newsData?.length || 0}`);

    if ((result.searchResults?.length || 0) > 0 && 
        (result.financialData?.length || 0) > 0 && 
        (result.newsData?.length || 0) > 0) {
      console.log('✅ All tools executed successfully');
    } else {
      console.log('⚠️ Some tools may not have returned data');
    }
  } catch (error) {
    console.log('❌ Multi-tool test failed:', error);
  }

  // Test 4: Handle unknown tools gracefully
  console.log('\n🛡️ Test 4: Handle unknown tools gracefully');
  try {
    const toolPlan: ToolPlan = {
      tools: ['TAVILY', 'UNKNOWN_TOOL'],
      queries: {
        'TAVILY': 'test query',
        'UNKNOWN_TOOL': 'should be ignored'
      }
    };

    const state: ResearchState = {
      researchQuery: 'test query',
      searchPlan: toolPlan
    };

    const result = await toolExecutor.executeToolPlan(toolPlan, state);

    if (result.searchResults && result.searchResults.length > 0) {
      console.log('✅ Successfully handled unknown tool');
    } else {
      console.log('❌ Failed to handle unknown tool gracefully');
    }
  } catch (error) {
    console.log('❌ Unknown tool test failed:', error);
  }

  console.log('\n🎉 ToolExecutor testing completed!');
}

// Run the test
testToolExecutor().catch(console.error); 