import { ContentSummarizerBrain } from '../brains/ContentSummarizerBrain';
import { ResearchState, SearchResult } from '../interfaces/state.interface';
import logger from '../utils/logger';

async function testTimeoutImprovements() {
  console.log('🧪 Testing Timeout Improvements...\n');

  // Create test data with large content that might cause timeouts
  const largeContent = 'This is a very long piece of content that might cause Ollama to timeout. '.repeat(1000);
  
  const testSearchResults: SearchResult[] = [
    {
      title: 'Large Content Test 1',
      url: 'https://example.com/large-content-1',
      content: 'Large content summary',
      rawContent: largeContent,
      score: 0.9
    },
    {
      title: 'Large Content Test 2', 
      url: 'https://example.com/large-content-2',
      content: 'Large content summary',
      rawContent: largeContent,
      score: 0.8
    }
  ];

  const testState: ResearchState = {
    researchQuery: 'Timeout test analysis',
    searchResults: testSearchResults
  };

  console.log('📊 Test Configuration:');
  console.log(`- Content length per result: ${largeContent.length} characters`);
  console.log(`- Number of results: ${testSearchResults.length}`);
  console.log(`- Max concurrency: 2 (reduced from 3)`);
  console.log(`- Timeout per request: 60 seconds`);
  console.log(`- Retry attempts: 3 per request`);
  console.log(`- Delay between batches: 2 seconds`);

  const summarizer = new ContentSummarizerBrain();
  const startTime = Date.now();

  try {
    console.log('\n🚀 Starting timeout-resilient summarization...');
    
    const result = await summarizer.invoke(testState);
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log('\n✅ Summarization completed successfully!');
    console.log(`⏱️  Total duration: ${duration.toFixed(2)} seconds`);
    console.log(`📄 Results processed: ${result.searchResults?.length || 0}`);
    
    // Check if all results have summaries
    const resultsWithSummaries = result.searchResults?.filter(r => r.summary) || [];
    console.log(`📝 Results with summaries: ${resultsWithSummaries.length}`);
    
    if (resultsWithSummaries.length === testSearchResults.length) {
      console.log('🎉 All results successfully summarized!');
    } else {
      console.log('⚠️  Some results may have used fallback summaries');
    }

    // Show summary lengths
    result.searchResults?.forEach((result, index) => {
      const summaryLength = result.summary?.length || 0;
      console.log(`  Result ${index + 1}: ${summaryLength} characters`);
    });

  } catch (error) {
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.error('\n❌ Timeout test failed:');
    console.error(`⏱️  Duration before failure: ${duration.toFixed(2)} seconds`);
    console.error('Error:', error);
  }

  console.log('\n📋 Timeout Improvements Summary:');
  console.log('✅ Reduced concurrency from 3 to 2');
  console.log('✅ Increased timeout from 30s to 60s');
  console.log('✅ Increased batch delay from 0.5s to 2s');
  console.log('✅ Increased retry delay with exponential backoff');
  console.log('✅ Enhanced fallback mechanisms');
}

// Run the test
testTimeoutImprovements(); 