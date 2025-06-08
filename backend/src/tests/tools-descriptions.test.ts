import { formatToolsForPrompt, getToolDescription, toolsDescriptions } from '../utils/tools-formatter';

async function testToolsDescriptions() {
  console.log('🧪 Testing Centralized Tool Descriptions...\n');

  // Test 1: Check that all tools are present
  console.log('📋 Available Tools:');
  console.log(Object.keys(toolsDescriptions));
  
  // Test 2: Test individual tool description
  console.log('\n🔍 Individual Tool Descriptions:');
  console.log('TAVILY:', getToolDescription('TAVILY'));
  console.log('YAHOO_FINANCE:', getToolDescription('YAHOO_FINANCE'));
  console.log('NEWSDATA:', getToolDescription('NEWSDATA'));
  
  // Test 3: Test formatted output for prompts
  console.log('\n📝 Formatted for Prompts:');
  console.log(formatToolsForPrompt());
  
  // Test 4: Test invalid tool
  console.log('\n❌ Invalid Tool Test:');
  console.log('INVALID_TOOL:', getToolDescription('INVALID_TOOL'));
  
  console.log('\n✅ Tool descriptions test completed successfully!');
}

// Run the test
testToolsDescriptions(); 