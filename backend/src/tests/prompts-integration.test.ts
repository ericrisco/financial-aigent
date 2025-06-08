import { SEARCH_PLANNER_PROMPT } from '../brains/prompts/search-planner.prompt';
import { GAP_ANALYZER_PROMPT } from '../brains/prompts/gap-analyzer.prompt';
import { toolsDescriptions } from '../utils/tools-formatter';

async function testPromptsIntegration() {
  console.log('🧪 Testing Prompts Integration with Centralized Tool Descriptions...\n');

  // Test 1: Verify Search Planner Prompt contains tool descriptions
  console.log('🔍 Testing Search Planner Prompt:');
  let hasAllTools = true;
  
  Object.entries(toolsDescriptions).forEach(([toolName, description]) => {
    const hasToolName = SEARCH_PLANNER_PROMPT.includes(toolName);
    const hasDescription = SEARCH_PLANNER_PROMPT.includes(description);
    
    console.log(`  ${toolName}: ${hasToolName && hasDescription ? '✅' : '❌'} (Name: ${hasToolName}, Desc: ${hasDescription})`);
    
    if (!hasToolName || !hasDescription) {
      hasAllTools = false;
    }
  });

  console.log(`\n📊 Search Planner Result: ${hasAllTools ? '✅ All tools integrated' : '❌ Missing tools'}`);

  // Test 2: Verify Gap Analyzer Prompt contains tool descriptions
  console.log('\n🔍 Testing Gap Analyzer Prompt:');
  let hasAllToolsGap = true;
  
  Object.entries(toolsDescriptions).forEach(([toolName, description]) => {
    const hasToolName = GAP_ANALYZER_PROMPT.includes(toolName);
    const hasDescription = GAP_ANALYZER_PROMPT.includes(description);
    
    console.log(`  ${toolName}: ${hasToolName && hasDescription ? '✅' : '❌'} (Name: ${hasToolName}, Desc: ${hasDescription})`);
    
    if (!hasToolName || !hasDescription) {
      hasAllToolsGap = false;
    }
  });

  console.log(`\n📊 Gap Analyzer Result: ${hasAllToolsGap ? '✅ All tools integrated' : '❌ Missing tools'}`);

  // Test 3: Check for consistency between prompts
  console.log('\n🔄 Testing Consistency Between Prompts:');
  const searchToolsMatch = SEARCH_PLANNER_PROMPT.match(/AVAILABLE TOOLS:([\s\S]*?)PROFESSIONAL RESEARCH STANDARDS:/);
  const gapToolsMatch = GAP_ANALYZER_PROMPT.match(/AVAILABLE TOOLS:([\s\S]*?)CONTEXT:/);
  
  const searchToolsSection = searchToolsMatch ? searchToolsMatch[1] : '';
  const gapToolsSection = gapToolsMatch ? gapToolsMatch[1] : '';
  
  const isConsistent = searchToolsSection.trim() === gapToolsSection.trim();
  console.log(`  Tool sections match: ${isConsistent ? '✅' : '❌'}`);

  // Final result
  const allTestsPassed = hasAllTools && hasAllToolsGap && isConsistent;
  console.log(`\n🏆 Overall Integration Test: ${allTestsPassed ? '✅ SUCCESS' : '❌ FAILED'}`);
  
  if (allTestsPassed) {
    console.log('🎉 All prompts are successfully using centralized tool descriptions!');
  } else {
    console.log('⚠️  Some prompts may not be using centralized descriptions correctly.');
  }
}

// Run the test
testPromptsIntegration(); 