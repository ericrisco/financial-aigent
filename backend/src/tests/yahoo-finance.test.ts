import { YahooFinanceTool } from '../tools/YahooFinanceTool';
import { ResearchState } from '../interfaces/state.interface';
import logger from '../utils/logger';

/**
 * Test script for Yahoo Finance Tool
 * 
 * This script tests the functionality of the YahooFinanceTool
 * to ensure it can retrieve financial data correctly.
 */

async function testYahooFinanceTool() {
  console.log('🧪 Testing Yahoo Finance Tool...\n');

  const yahooFinanceTool = new YahooFinanceTool();

  // Test 1: Basic symbol extraction and data retrieval
  console.log('📊 Test 1: Basic symbol extraction (AAPL)');
  const testState1: ResearchState = {
    researchQuery: 'Apple stock analysis',
    searchPlan: 'AAPL stock price and performance metrics',
    findGapLoops: 0
  };

  try {
    const result1 = await yahooFinanceTool.invoke(testState1);
    
    if (result1.financialData && result1.financialData.length > 0) {
      const appleData = result1.financialData[0];
      console.log('✅ Successfully retrieved Apple data');
      console.log(`   Symbol: ${appleData.symbol}`);
      console.log(`   Has quote data: ${!!appleData.quote}`);
      console.log(`   Has historical data: ${!!appleData.historical}`);
      console.log(`   Summary length: ${appleData.summary?.length || 0} characters`);
      
      if (appleData.quote) {
        console.log(`   Current price: $${appleData.quote.regularMarketPrice?.toFixed(2) || 'N/A'}`);
        console.log(`   Market cap: $${((appleData.quote.marketCap || 0) / 1e9).toFixed(2)}B`);
      }
    } else {
      console.log('❌ No financial data retrieved for Apple');
    }
  } catch (error) {
    console.log('❌ Test 1 failed:', error);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 2: Multiple symbols
  console.log('📊 Test 2: Multiple symbols (AAPL, MSFT)');
  const testState2: ResearchState = {
    researchQuery: 'Tech stocks comparison',
    searchPlan: 'AAPL MSFT technology stocks comparison',
    findGapLoops: 0
  };

  try {
    const result2 = await yahooFinanceTool.invoke(testState2);
    
    if (result2.financialData) {
      console.log(`✅ Retrieved data for ${result2.financialData.length} symbols`);
      result2.financialData.forEach((data, index) => {
        console.log(`   ${index + 1}. ${data.symbol} - ${data.quote?.shortName || data.quote?.longName || 'Unknown'}`);
        if (data.quote?.regularMarketPrice) {
          console.log(`      Price: $${data.quote.regularMarketPrice.toFixed(2)}`);
        }
      });
    } else {
      console.log('❌ No financial data retrieved for multiple symbols');
    }
  } catch (error) {
    console.log('❌ Test 2 failed:', error);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 3: Company name search
  console.log('📊 Test 3: Company name search (Tesla)');
  const testState3: ResearchState = {
    researchQuery: 'Tesla financial analysis',
    searchPlan: 'Tesla electric vehicle company financial performance',
    findGapLoops: 0
  };

  try {
    const result3 = await yahooFinanceTool.invoke(testState3);
    
    if (result3.financialData && result3.financialData.length > 0) {
      console.log('✅ Successfully found Tesla data via company name search');
      const teslaData = result3.financialData[0];
      console.log(`   Found symbol: ${teslaData.symbol}`);
      console.log(`   Company name: ${teslaData.quote?.longName || teslaData.quote?.shortName || 'Unknown'}`);
      
      if (teslaData.historical && teslaData.historical.length > 0) {
        console.log(`   Historical data points: ${teslaData.historical.length}`);
        const latest = teslaData.historical[teslaData.historical.length - 1];
        console.log(`   Latest close: $${latest.close.toFixed(2)}`);
      }
    } else {
      console.log('❌ No data found for Tesla via company name search');
    }
  } catch (error) {
    console.log('❌ Test 3 failed:', error);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 4: Error handling - invalid symbol
  console.log('📊 Test 4: Error handling (invalid symbol)');
  const testState4: ResearchState = {
    researchQuery: 'Invalid stock analysis',
    searchPlan: 'INVALIDXYZ stock analysis',
    findGapLoops: 0
  };

  try {
    const result4 = await yahooFinanceTool.invoke(testState4);
    
    if (!result4.financialData || result4.financialData.length === 0) {
      console.log('✅ Correctly handled invalid symbol (no data returned)');
    } else {
      console.log('⚠️  Unexpected: Got data for invalid symbol');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log('✅ Correctly handled invalid symbol with error:', errorMessage);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 5: Performance test
  console.log('📊 Test 5: Performance test (multiple symbols)');
  const testState5: ResearchState = {
    researchQuery: 'Major tech stocks',
    searchPlan: 'AAPL GOOGL MSFT AMZN TSLA performance analysis',
    findGapLoops: 0
  };

  try {
    const startTime = Date.now();
    const result5 = await yahooFinanceTool.invoke(testState5);
    const endTime = Date.now();
    
    const duration = endTime - startTime;
    console.log(`✅ Performance test completed in ${duration}ms`);
    console.log(`   Retrieved data for ${result5.financialData?.length || 0} symbols`);
    console.log(`   Average time per symbol: ${duration / (result5.financialData?.length || 1)}ms`);
  } catch (error) {
    console.log('❌ Performance test failed:', error);
  }

  console.log('\n🎉 Yahoo Finance Tool testing completed!');
}

// Run the test if this file is executed directly
if (require.main === module) {
  testYahooFinanceTool().catch(error => {
    logger.error('Test execution failed:', error);
    process.exit(1);
  });
}

export { testYahooFinanceTool }; 