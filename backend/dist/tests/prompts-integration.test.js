"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const search_planner_prompt_1 = require("../brains/prompts/search-planner.prompt");
const gap_analyzer_prompt_1 = require("../brains/prompts/gap-analyzer.prompt");
const tools_formatter_1 = require("../utils/tools-formatter");
function testPromptsIntegration() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('🧪 Testing Prompts Integration with Centralized Tool Descriptions...\n');
        // Test 1: Verify Search Planner Prompt contains tool descriptions
        console.log('🔍 Testing Search Planner Prompt:');
        let hasAllTools = true;
        Object.entries(tools_formatter_1.toolsDescriptions).forEach(([toolName, description]) => {
            const hasToolName = search_planner_prompt_1.SEARCH_PLANNER_PROMPT.includes(toolName);
            const hasDescription = search_planner_prompt_1.SEARCH_PLANNER_PROMPT.includes(description);
            console.log(`  ${toolName}: ${hasToolName && hasDescription ? '✅' : '❌'} (Name: ${hasToolName}, Desc: ${hasDescription})`);
            if (!hasToolName || !hasDescription) {
                hasAllTools = false;
            }
        });
        console.log(`\n📊 Search Planner Result: ${hasAllTools ? '✅ All tools integrated' : '❌ Missing tools'}`);
        // Test 2: Verify Gap Analyzer Prompt contains tool descriptions
        console.log('\n🔍 Testing Gap Analyzer Prompt:');
        let hasAllToolsGap = true;
        Object.entries(tools_formatter_1.toolsDescriptions).forEach(([toolName, description]) => {
            const hasToolName = gap_analyzer_prompt_1.GAP_ANALYZER_PROMPT.includes(toolName);
            const hasDescription = gap_analyzer_prompt_1.GAP_ANALYZER_PROMPT.includes(description);
            console.log(`  ${toolName}: ${hasToolName && hasDescription ? '✅' : '❌'} (Name: ${hasToolName}, Desc: ${hasDescription})`);
            if (!hasToolName || !hasDescription) {
                hasAllToolsGap = false;
            }
        });
        console.log(`\n📊 Gap Analyzer Result: ${hasAllToolsGap ? '✅ All tools integrated' : '❌ Missing tools'}`);
        // Test 3: Check for consistency between prompts
        console.log('\n🔄 Testing Consistency Between Prompts:');
        const searchToolsMatch = search_planner_prompt_1.SEARCH_PLANNER_PROMPT.match(/AVAILABLE TOOLS:([\s\S]*?)PROFESSIONAL RESEARCH STANDARDS:/);
        const gapToolsMatch = gap_analyzer_prompt_1.GAP_ANALYZER_PROMPT.match(/AVAILABLE TOOLS:([\s\S]*?)CONTEXT:/);
        const searchToolsSection = searchToolsMatch ? searchToolsMatch[1] : '';
        const gapToolsSection = gapToolsMatch ? gapToolsMatch[1] : '';
        const isConsistent = searchToolsSection.trim() === gapToolsSection.trim();
        console.log(`  Tool sections match: ${isConsistent ? '✅' : '❌'}`);
        // Final result
        const allTestsPassed = hasAllTools && hasAllToolsGap && isConsistent;
        console.log(`\n🏆 Overall Integration Test: ${allTestsPassed ? '✅ SUCCESS' : '❌ FAILED'}`);
        if (allTestsPassed) {
            console.log('🎉 All prompts are successfully using centralized tool descriptions!');
        }
        else {
            console.log('⚠️  Some prompts may not be using centralized descriptions correctly.');
        }
    });
}
// Run the test
testPromptsIntegration();
