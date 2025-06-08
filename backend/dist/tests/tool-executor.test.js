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
const ToolExecutor_1 = require("../tools/ToolExecutor");
function testToolExecutor() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f;
        console.log('🧪 Testing ToolExecutor...\n');
        const toolExecutor = new ToolExecutor_1.ToolExecutor();
        // Test 1: Execute Tavily tool only
        console.log('📝 Test 1: Execute Tavily tool only');
        try {
            const toolPlan = {
                tools: ['TAVILY'],
                queries: {
                    'TAVILY': 'artificial intelligence trends 2024'
                }
            };
            const state = {
                researchQuery: 'AI trends',
                searchPlan: toolPlan
            };
            const result = yield toolExecutor.executeToolPlan(toolPlan, state);
            if (result.searchResults && result.searchResults.length > 0) {
                console.log(`✅ Tavily results: ${result.searchResults.length} items`);
            }
            else {
                console.log('❌ No Tavily results found');
            }
        }
        catch (error) {
            console.log('❌ Tavily test failed:', error);
        }
        // Test 2: Execute Yahoo Finance tool only
        console.log('\n📈 Test 2: Execute Yahoo Finance tool only');
        try {
            const toolPlan = {
                tools: ['YAHOO_FINANCE'],
                queries: {
                    'YAHOO_FINANCE': 'AAPL MSFT stock analysis'
                }
            };
            const state = {
                researchQuery: 'Apple Microsoft stock analysis',
                searchPlan: toolPlan
            };
            const result = yield toolExecutor.executeToolPlan(toolPlan, state);
            if (result.financialData && result.financialData.length > 0) {
                console.log(`✅ Financial data: ${result.financialData.length} items`);
            }
            else {
                console.log('❌ No financial data found');
            }
            if (result.searchResults && result.searchResults.length > 0) {
                console.log(`✅ Search results: ${result.searchResults.length} items`);
            }
            else {
                console.log('❌ No search results found');
            }
        }
        catch (error) {
            console.log('❌ Yahoo Finance test failed:', error);
        }
        // Test 3: Execute multiple tools in parallel
        console.log('\n🚀 Test 3: Execute multiple tools in parallel');
        try {
            const toolPlan = {
                tools: ['TAVILY', 'YAHOO_FINANCE', 'NEWSDATA'],
                queries: {
                    'TAVILY': 'Tesla company analysis 2024',
                    'YAHOO_FINANCE': 'TSLA stock performance',
                    'NEWSDATA': 'Tesla latest news developments'
                }
            };
            const state = {
                researchQuery: 'Tesla comprehensive analysis',
                searchPlan: toolPlan
            };
            const result = yield toolExecutor.executeToolPlan(toolPlan, state);
            console.log(`📊 Total search results: ${((_a = result.searchResults) === null || _a === void 0 ? void 0 : _a.length) || 0}`);
            console.log(`💰 Financial data items: ${((_b = result.financialData) === null || _b === void 0 ? void 0 : _b.length) || 0}`);
            console.log(`📰 News data items: ${((_c = result.newsData) === null || _c === void 0 ? void 0 : _c.length) || 0}`);
            if ((((_d = result.searchResults) === null || _d === void 0 ? void 0 : _d.length) || 0) > 0 &&
                (((_e = result.financialData) === null || _e === void 0 ? void 0 : _e.length) || 0) > 0 &&
                (((_f = result.newsData) === null || _f === void 0 ? void 0 : _f.length) || 0) > 0) {
                console.log('✅ All tools executed successfully');
            }
            else {
                console.log('⚠️ Some tools may not have returned data');
            }
        }
        catch (error) {
            console.log('❌ Multi-tool test failed:', error);
        }
        // Test 4: Handle unknown tools gracefully
        console.log('\n🛡️ Test 4: Handle unknown tools gracefully');
        try {
            const toolPlan = {
                tools: ['TAVILY', 'UNKNOWN_TOOL'],
                queries: {
                    'TAVILY': 'test query',
                    'UNKNOWN_TOOL': 'should be ignored'
                }
            };
            const state = {
                researchQuery: 'test query',
                searchPlan: toolPlan
            };
            const result = yield toolExecutor.executeToolPlan(toolPlan, state);
            if (result.searchResults && result.searchResults.length > 0) {
                console.log('✅ Successfully handled unknown tool');
            }
            else {
                console.log('❌ Failed to handle unknown tool gracefully');
            }
        }
        catch (error) {
            console.log('❌ Unknown tool test failed:', error);
        }
        console.log('\n🎉 ToolExecutor testing completed!');
    });
}
// Run the test
testToolExecutor().catch(console.error);
