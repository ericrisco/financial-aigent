import { DocumentStructureBrain } from '../brains/DocumentStructureBrain';
import { ContentGeneratorBrain } from '../brains/ContentGeneratorBrain';
import { ResearchState } from '../interfaces/state.interface';

async function testImprovedContentGeneration() {
  console.log('🧪 Testing Improved Content Generation System...\n');

  // Mock research state with Meta analysis
  const mockState: ResearchState = {
    researchQuery: 'Meta (Facebook) stock analysis',
    searchResults: [
      {
        title: 'Meta Financial Performance Q3 2024',
        url: 'https://example.com/meta-q3',
        content: 'Meta reported strong Q3 2024 results with revenue growth',
        rawContent: 'Meta Platforms Inc. reported Q3 2024 revenue of $40.59 billion, up 19% year-over-year. The company showed strong performance in advertising revenue and user engagement across its family of apps.',
        score: 0.9,
        summary: 'Meta reported Q3 2024 revenue of $40.59 billion with 19% YoY growth. Strong advertising revenue and user engagement. Reality Labs segment continues investment in VR/AR technology.'
      },
      {
        title: 'Meta Stock Analysis - Investment Outlook',
        url: 'https://example.com/meta-outlook',
        content: 'Investment analysis of Meta stock with price targets',
        rawContent: 'Meta stock has shown resilience in 2024 with strong fundamentals. The company trades at a P/E ratio of approximately 24x forward earnings. Analysts maintain positive outlook on advertising recovery and AI investments.',
        score: 0.85,
        summary: 'Meta stock trades at 24x forward P/E. Positive analyst outlook on advertising recovery and AI investments. Strong fundamentals support current valuation levels.'
      }
    ]
  };

  try {
    // Test 1: Document Structure Generation
    console.log('📋 Test 1: Document Structure Generation');
    const structureBrain = new DocumentStructureBrain();
    const structureResult = await structureBrain.invoke(mockState);
    
    console.log('✅ Structure Generated:');
    console.log(structureResult.documentStructure?.substring(0, 300) + '...\n');

    // Test 2: Content Generation
    console.log('📝 Test 2: Content Generation');
    const contentBrain = new ContentGeneratorBrain();
    const contentResult = await contentBrain.invoke(structureResult);
    
    console.log('✅ Content Generated:');
    console.log('Content Length:', contentResult.finalDocument?.length);
    console.log('First 500 characters:');
    console.log(contentResult.finalDocument?.substring(0, 500) + '...\n');

    // Test 3: Validation
    console.log('🔍 Test 3: Content Validation');
    const content = contentResult.finalDocument || '';
    const lines = content.split('\n').filter(line => line.trim());
    const uniqueLines = new Set(lines);
    const duplicateRatio = 1 - (uniqueLines.size / lines.length);
    
    console.log(`Total lines: ${lines.length}`);
    console.log(`Unique lines: ${uniqueLines.size}`);
    console.log(`Duplicate ratio: ${(duplicateRatio * 100).toFixed(2)}%`);
    
    if (duplicateRatio < 0.8) {
      console.log('✅ Content validation passed - Low repetition');
    } else {
      console.log('❌ Content validation failed - High repetition');
    }

    // Test 4: Structure compliance
    console.log('\n📊 Test 4: Structure Compliance');
    const hasHeaders = content.includes('# Análisis Financiero');
    const hasSections = content.includes('## Resumen Ejecutivo') && 
                       content.includes('## Análisis Financiero') &&
                       content.includes('## Recomendación de Inversión');
    
    console.log(`Has main header: ${hasHeaders ? '✅' : '❌'}`);
    console.log(`Has required sections: ${hasSections ? '✅' : '❌'}`);

    console.log('\n🎉 Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testImprovedContentGeneration(); 