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
const tools_formatter_1 = require("../utils/tools-formatter");
function testToolsDescriptions() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('🧪 Testing Centralized Tool Descriptions...\n');
        // Test 1: Check that all tools are present
        console.log('📋 Available Tools:');
        console.log(Object.keys(tools_formatter_1.toolsDescriptions));
        // Test 2: Test individual tool description
        console.log('\n🔍 Individual Tool Descriptions:');
        console.log('TAVILY:', (0, tools_formatter_1.getToolDescription)('TAVILY'));
        console.log('YAHOO_FINANCE:', (0, tools_formatter_1.getToolDescription)('YAHOO_FINANCE'));
        console.log('NEWSDATA:', (0, tools_formatter_1.getToolDescription)('NEWSDATA'));
        // Test 3: Test formatted output for prompts
        console.log('\n📝 Formatted for Prompts:');
        console.log((0, tools_formatter_1.formatToolsForPrompt)());
        // Test 4: Test invalid tool
        console.log('\n❌ Invalid Tool Test:');
        console.log('INVALID_TOOL:', (0, tools_formatter_1.getToolDescription)('INVALID_TOOL'));
        console.log('\n✅ Tool descriptions test completed successfully!');
    });
}
// Run the test
testToolsDescriptions();
