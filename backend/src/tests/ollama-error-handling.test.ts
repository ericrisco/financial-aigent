import { ContentSummarizerBrain } from '../brains/ContentSummarizerBrain';
import { DocumentStructureBrain } from '../brains/DocumentStructureBrain';
import { ContentGeneratorBrain } from '../brains/ContentGeneratorBrain';
import { ResearchState, SearchResult } from '../interfaces/state.interface';
import logger from '../utils/logger';

async function testOllamaErrorHandling() {
  console.log('🧪 Testing Ollama Error Handling...\n');

  // Test data with problematic content that might cause Ollama issues
  const testSearchResults: SearchResult[] = [
    {
      title: 'Google Stock Analysis',
      url: 'https://example.com/google-analysis',
      content: 'Google stock analysis content',
      rawContent: 'This is a very long content that might cause Ollama to timeout or return undefined content. '.repeat(100),
      score: 0.9
    },
    {
      title: 'Financial Data',
      url: 'https://example.com/financial-data',
      content: 'Financial data content',
      rawContent: 'Short content',
      score: 0.8
    }
  ];

  const testState: ResearchState = {
    researchQuery: 'Google stock analysis test',
    searchResults: testSearchResults,
    documentStructure: '# Test Structure\n## Section 1\n## Section 2'
  };

  console.log('🔍 Testing ContentSummarizerBrain error handling...');
  
  try {
    const summarizer = new ContentSummarizerBrain();
    const summarizerResult = await summarizer.invoke(testState);
    
    console.log('✅ ContentSummarizerBrain completed successfully');
    console.log(`📊 Processed ${summarizerResult.searchResults?.length || 0} results`);
    
    // Check that all results have summaries (either real or fallback)
    const resultsWithSummaries = summarizerResult.searchResults?.filter(r => r.summary) || [];
    console.log(`📝 Results with summaries: ${resultsWithSummaries.length}`);
    
    if (resultsWithSummaries.length === testSearchResults.length) {
      console.log('✅ All results have summaries (fallbacks working)');
    } else {
      console.log('⚠️  Some results missing summaries');
    }
    
  } catch (error) {
    console.error('❌ ContentSummarizerBrain failed:', error);
  }

  console.log('\n🏗️  Testing DocumentStructureBrain error handling...');
  
  try {
    const structureGenerator = new DocumentStructureBrain();
    const structureResult = await structureGenerator.invoke(testState);
    
    console.log('✅ DocumentStructureBrain completed successfully');
    console.log(`📄 Structure length: ${structureResult.documentStructure?.length || 0} characters`);
    
    if (structureResult.documentStructure && structureResult.documentStructure.length > 100) {
      console.log('✅ Generated substantial structure');
    } else {
      console.log('⚠️  Generated minimal structure (likely fallback)');
    }
    
  } catch (error) {
    console.error('❌ DocumentStructureBrain failed:', error);
  }

  console.log('\n📝 Testing ContentGeneratorBrain error handling...');
  
  try {
    const contentGenerator = new ContentGeneratorBrain();
    const contentResult = await contentGenerator.invoke(testState);
    
    console.log('✅ ContentGeneratorBrain completed successfully');
    console.log(`📄 Content length: ${contentResult.finalDocument?.length || 0} characters`);
    
    if (contentResult.finalDocument && contentResult.finalDocument.length > 1000) {
      console.log('✅ Generated substantial content');
    } else {
      console.log('⚠️  Generated minimal content (likely fallback)');
    }
    
    // Check for repetitive content
    if (contentResult.finalDocument) {
      const lines = contentResult.finalDocument.split('\n').filter(line => line.trim());
      const uniqueLines = new Set(lines);
      const duplicateRatio = 1 - (uniqueLines.size / lines.length);
      
      if (duplicateRatio < 0.5) {
        console.log('✅ Content appears non-repetitive');
      } else {
        console.log('⚠️  Content appears repetitive');
      }
    }
    
  } catch (error) {
    console.error('❌ ContentGeneratorBrain failed:', error);
  }

  console.log('\n🎯 Testing with minimal state (edge case)...');
  
  const minimalState: ResearchState = {
    researchQuery: 'Test query',
    searchResults: [{
      title: 'Test',
      url: 'https://test.com',
      content: 'Test content',
      rawContent: '',
      score: 0.5
    }]
  };

  try {
    const summarizer = new ContentSummarizerBrain();
    const result = await summarizer.invoke(minimalState);
    
    if (result.searchResults?.[0]?.summary) {
      console.log('✅ Minimal state handled correctly with fallback summary');
    } else {
      console.log('❌ Minimal state not handled properly');
    }
    
  } catch (error) {
    console.error('❌ Minimal state test failed:', error);
  }

  console.log('\n✅ Ollama error handling tests completed!');
}

// Run the test
testOllamaErrorHandling(); 