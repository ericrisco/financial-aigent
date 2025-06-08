import { NewsDataTool } from '../tools/NewsDataTool';
import { ResearchState } from '../interfaces/state.interface';
import logger from '../utils/logger';

/**
 * Test script for NewsData Tool
 * 
 * This script tests the functionality of the NewsDataTool
 * to ensure it can retrieve news data correctly.
 */

async function testNewsDataTool() {
  console.log('🧪 Testing NewsData Tool...\n');

  const newsDataTool = new NewsDataTool();

  // Test 1: Basic news search
  console.log('📰 Test 1: Basic news search (technology)');
  const testState1: ResearchState = {
    researchQuery: 'Technology news',
    searchPlan: 'latest technology news and innovations',
    findGapLoops: 0
  };

  try {
    const result1 = await newsDataTool.invoke(testState1);
    
    if (result1.newsData && result1.newsData.length > 0) {
      const newsData = result1.newsData[0];
      console.log('✅ Successfully retrieved news data');
      console.log(`   Total results: ${newsData.totalResults}`);
      console.log(`   Articles retrieved: ${newsData.articles.length}`);
      console.log(`   Has summary: ${!!newsData.summary}`);
      console.log(`   Summary length: ${newsData.summary?.length || 0} characters`);
      
      if (newsData.articles.length > 0) {
        const firstArticle = newsData.articles[0];
        console.log(`   First article: ${firstArticle.title}`);
        console.log(`   Source: ${firstArticle.source_id}`);
        console.log(`   Categories: ${firstArticle.category?.join(', ') || 'None'}`);
      }
    } else {
      console.log('❌ No news data retrieved');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log('❌ Test 1 failed:', errorMessage);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 2: Category-specific search
  console.log('📰 Test 2: Category-specific search (business)');
  const testState2: ResearchState = {
    researchQuery: 'Business news',
    searchPlan: 'business financial markets economy',
    findGapLoops: 0
  };

  try {
    const result2 = await newsDataTool.invoke(testState2);
    
    if (result2.newsData && result2.newsData.length > 0) {
      const newsData = result2.newsData[0];
      console.log('✅ Successfully retrieved business news');
      console.log(`   Total results: ${newsData.totalResults}`);
      console.log(`   Articles retrieved: ${newsData.articles.length}`);
      
      // Check if business category is detected
      const businessArticles = newsData.articles.filter(article => 
        article.category?.includes('business')
      );
      console.log(`   Business articles: ${businessArticles.length}`);
      
      if (newsData.articles.length > 0) {
        console.log('   Sample articles:');
        newsData.articles.slice(0, 3).forEach((article, index) => {
          console.log(`     ${index + 1}. ${article.title.substring(0, 60)}...`);
          console.log(`        Source: ${article.source_id} | Categories: ${article.category?.join(', ') || 'None'}`);
        });
      }
    } else {
      console.log('❌ No business news data retrieved');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log('❌ Test 2 failed:', errorMessage);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 3: Time-sensitive search
  console.log('📰 Test 3: Time-sensitive search (today)');
  const testState3: ResearchState = {
    researchQuery: 'Today news',
    searchPlan: 'today breaking news current events',
    findGapLoops: 0
  };

  try {
    const result3 = await newsDataTool.invoke(testState3);
    
    if (result3.newsData && result3.newsData.length > 0) {
      const newsData = result3.newsData[0];
      console.log('✅ Successfully retrieved today\'s news');
      console.log(`   Total results: ${newsData.totalResults}`);
      console.log(`   Articles retrieved: ${newsData.articles.length}`);
      
      // Check search parameters for time range
      if (newsData.searchParams?.from_date) {
        console.log(`   Date range: ${newsData.searchParams.from_date} to ${newsData.searchParams.to_date}`);
      }
      
      if (newsData.articles.length > 0) {
        const today = new Date().toDateString();
        const todayArticles = newsData.articles.filter(article => {
          const articleDate = new Date(article.pubDate).toDateString();
          return articleDate === today;
        });
        console.log(`   Articles from today: ${todayArticles.length}`);
      }
    } else {
      console.log('❌ No today\'s news data retrieved');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log('❌ Test 3 failed:', errorMessage);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 4: Country-specific search
  console.log('📰 Test 4: Country-specific search (USA)');
  const testState4: ResearchState = {
    researchQuery: 'USA news',
    searchPlan: 'United States america news politics',
    findGapLoops: 0
  };

  try {
    const result4 = await newsDataTool.invoke(testState4);
    
    if (result4.newsData && result4.newsData.length > 0) {
      const newsData = result4.newsData[0];
      console.log('✅ Successfully retrieved USA news');
      console.log(`   Total results: ${newsData.totalResults}`);
      console.log(`   Articles retrieved: ${newsData.articles.length}`);
      
      // Check search parameters for country
      if (newsData.searchParams?.country) {
        console.log(`   Country filter: ${newsData.searchParams.country}`);
      }
      
      if (newsData.articles.length > 0) {
        const usArticles = newsData.articles.filter(article => 
          article.country?.includes('us') || article.country?.includes('united states')
        );
        console.log(`   US-specific articles: ${usArticles.length}`);
      }
    } else {
      console.log('❌ No USA news data retrieved');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log('❌ Test 4 failed:', errorMessage);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 5: Performance test
  console.log('📰 Test 5: Performance test (multiple keywords)');
  const testState5: ResearchState = {
    researchQuery: 'Technology business sports',
    searchPlan: 'technology business sports entertainment health science',
    findGapLoops: 0
  };

  try {
    const startTime = Date.now();
    const result5 = await newsDataTool.invoke(testState5);
    const endTime = Date.now();
    
    const duration = endTime - startTime;
    console.log(`✅ Performance test completed in ${duration}ms`);
    
    if (result5.newsData && result5.newsData.length > 0) {
      const newsData = result5.newsData[0];
      console.log(`   Retrieved ${newsData.articles.length} articles`);
      console.log(`   Total results available: ${newsData.totalResults}`);
      console.log(`   Average time per article: ${(duration / newsData.articles.length).toFixed(2)}ms`);
      
      // Category distribution
      const categoryCount = newsData.articles.reduce((acc, article) => {
        article.category?.forEach(cat => {
          acc[cat] = (acc[cat] || 0) + 1;
        });
        return acc;
      }, {} as { [key: string]: number });
      
      console.log('   Category distribution:');
      Object.entries(categoryCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .forEach(([category, count]) => {
          console.log(`     - ${category}: ${count} articles`);
        });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log('❌ Performance test failed:', errorMessage);
  }

  console.log('\n🎉 NewsData Tool testing completed!');
}

// Run the test if this file is executed directly
if (require.main === module) {
  testNewsDataTool().catch(error => {
    logger.error('Test execution failed:', error);
    process.exit(1);
  });
}

export { testNewsDataTool }; 