import { createResearchGraph } from '../graph/research.graph';
import { ResearchState } from '../interfaces/state.interface';
import logger from '../utils/logger';

async function testSuperProAnalysis() {
  console.log('🏆 Testing SUPER PRO Analysis Standards...\n');

  const initialState: ResearchState = {
    researchQuery: 'Apple stock comprehensive investment analysis'
  };

  let stepCount = 0;
  let gapLoops = 0;
  let lastStep = '';
  const stepHistory: string[] = [];
  const gapAnalysisResults: string[] = [];

  const graph = createResearchGraph((step, progress, details) => {
    stepCount++;
    lastStep = step;
    stepHistory.push(`${stepCount}: ${step} (${progress}%) - ${details}`);
    console.log(`📊 Step ${stepCount}: ${step} (${progress}%) - ${details}`);
    
    if (step === 'analyze_gaps') {
      gapLoops++;
      gapAnalysisResults.push(`Gap Analysis ${gapLoops}: ${details}`);
    }
    
    // Safety check for SUPER PRO analysis (should be more thorough)
    if (stepCount > 25) {
      console.error('❌ Too many steps detected, analysis may be too demanding');
      throw new Error('Test safety limit reached');
    }
  });

  const startTime = Date.now();

  try {
    console.log('🚀 Starting SUPER PRO analysis with enhanced standards...\n');
    
    const result = await graph.invoke(initialState);
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log('\n✅ SUPER PRO Analysis completed successfully!');
    console.log(`⏱️  Duration: ${duration.toFixed(2)} seconds`);
    console.log(`🔄 Total steps: ${stepCount}`);
    console.log(`🔍 Gap analysis loops: ${gapLoops}`);
    console.log(`📄 Final document length: ${result.finalDocument?.length || 0} characters`);
    
    console.log('\n📊 Step History:');
    stepHistory.forEach(step => console.log(`  ${step}`));
    
    console.log('\n🔍 Gap Analysis Results:');
    gapAnalysisResults.forEach(gap => console.log(`  ${gap}`));
    
    console.log('\n📈 SUPER PRO Quality Assessment:');
    console.log(`- Search results: ${result.searchResults?.length || 0}`);
    console.log(`- Financial data sources: ${result.financialData?.length || 0}`);
    console.log(`- News data sources: ${result.newsData?.length || 0}`);
    console.log(`- Gap analysis loops: ${result.findGapLoops || 0}`);
    console.log(`- Has final document: ${!!result.finalDocument}`);

    // SUPER PRO Quality Checks
    let qualityScore = 0;
    const maxScore = 10;

    // Check 1: Multiple gap analysis loops (more thorough)
    if (gapLoops >= 2) {
      qualityScore += 2;
      console.log('✅ SUPER PRO: Multiple gap analysis rounds completed');
    } else {
      console.log('⚠️  SUPER PRO: Limited gap analysis rounds');
    }

    // Check 2: Comprehensive data sources
    if ((result.searchResults?.length || 0) >= 5) {
      qualityScore += 2;
      console.log('✅ SUPER PRO: Comprehensive source diversity');
    } else {
      console.log('⚠️  SUPER PRO: Limited source diversity');
    }

    // Check 3: Financial data presence
    if ((result.financialData?.length || 0) >= 1) {
      qualityScore += 2;
      console.log('✅ SUPER PRO: Financial data included');
    } else {
      console.log('❌ SUPER PRO: Missing financial data');
    }

    // Check 4: News data presence
    if ((result.newsData?.length || 0) >= 1) {
      qualityScore += 2;
      console.log('✅ SUPER PRO: Current news data included');
    } else {
      console.log('❌ SUPER PRO: Missing news data');
    }

    // Check 5: Document length (institutional quality)
    if ((result.finalDocument?.length || 0) >= 5000) {
      qualityScore += 2;
      console.log('✅ SUPER PRO: Comprehensive document length');
    } else {
      console.log('⚠️  SUPER PRO: Document may lack institutional depth');
    }

    console.log(`\n🏆 SUPER PRO Quality Score: ${qualityScore}/${maxScore}`);
    
    if (qualityScore >= 8) {
      console.log('🌟 EXCELLENT: Analysis meets SUPER PRO institutional standards');
    } else if (qualityScore >= 6) {
      console.log('✅ GOOD: Analysis meets enhanced professional standards');
    } else {
      console.log('⚠️  NEEDS IMPROVEMENT: Analysis may not meet SUPER PRO standards');
    }

    // Content quality analysis
    if (result.finalDocument) {
      const content = result.finalDocument.toLowerCase();
      const hasFinancialMetrics = content.includes('ratio') || content.includes('earnings') || content.includes('revenue');
      const hasMarketAnalysis = content.includes('competitive') || content.includes('market') || content.includes('industry');
      const hasRiskAssessment = content.includes('risk') || content.includes('threat') || content.includes('challenge');
      const hasRecentData = content.includes('2024') || content.includes('recent') || content.includes('latest');

      console.log('\n📋 Content Quality Analysis:');
      console.log(`- Financial metrics: ${hasFinancialMetrics ? '✅' : '❌'}`);
      console.log(`- Market analysis: ${hasMarketAnalysis ? '✅' : '❌'}`);
      console.log(`- Risk assessment: ${hasRiskAssessment ? '✅' : '❌'}`);
      console.log(`- Recent data: ${hasRecentData ? '✅' : '❌'}`);
    }

  } catch (error) {
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.error('\n❌ SUPER PRO Analysis failed:');
    console.error(`⏱️  Duration before failure: ${duration.toFixed(2)} seconds`);
    console.error(`🔄 Steps completed: ${stepCount}`);
    console.error(`🔍 Gap loops completed: ${gapLoops}`);
    console.error(`📍 Last step: ${lastStep}`);
    console.error('Error:', error);
    
    console.log('\n📊 Step History before failure:');
    stepHistory.forEach(step => console.log(`  ${step}`));
    
    if (gapAnalysisResults.length > 0) {
      console.log('\n🔍 Gap Analysis History:');
      gapAnalysisResults.forEach(gap => console.log(`  ${gap}`));
    }
  }
}

// Run the test
testSuperProAnalysis(); 