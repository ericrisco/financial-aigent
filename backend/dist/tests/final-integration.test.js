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
const research_graph_1 = require("../graph/research.graph");
function testFinalIntegration() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f;
        console.log('🎯 Final Integration Test - Multi-Tool Research System\n');
        const graph = (0, research_graph_1.createResearchGraph)((step, progress, details) => {
            console.log(`📊 ${step}: ${progress}% - ${details}`);
        });
        try {
            const initialState = {
                researchQuery: 'Apple AAPL stock price today'
            };
            console.log('🚀 Starting complete research workflow...\n');
            const startTime = Date.now();
            const result = yield graph.invoke(initialState);
            const endTime = Date.now();
            const duration = ((endTime - startTime) / 1000).toFixed(2);
            console.log('\n🎉 Research Completed Successfully!');
            console.log('=====================================');
            console.log(`⏱️  Duration: ${duration} seconds`);
            console.log(`🔍 Search Results: ${((_a = result.searchResults) === null || _a === void 0 ? void 0 : _a.length) || 0} items`);
            console.log(`💰 Financial Data: ${((_b = result.financialData) === null || _b === void 0 ? void 0 : _b.length) || 0} items`);
            console.log(`📰 News Data: ${((_c = result.newsData) === null || _c === void 0 ? void 0 : _c.length) || 0} items`);
            console.log(`🔄 Gap Search Loops: ${result.findGapLoops || 0}`);
            if (result.searchPlan) {
                console.log(`🛠️  Tools Used: ${result.searchPlan.tools.join(', ')}`);
            }
            if (result.finalDocument) {
                console.log(`📄 Final Document: ${result.finalDocument.length} characters`);
                console.log('\n📖 Document Preview:');
                console.log('─'.repeat(50));
                console.log(result.finalDocument.substring(0, 400) + '...');
                console.log('─'.repeat(50));
            }
            // Verify we got data from multiple sources
            const hasFinancialData = (((_d = result.financialData) === null || _d === void 0 ? void 0 : _d.length) || 0) > 0;
            const hasNewsData = (((_e = result.newsData) === null || _e === void 0 ? void 0 : _e.length) || 0) > 0;
            const hasSearchResults = (((_f = result.searchResults) === null || _f === void 0 ? void 0 : _f.length) || 0) > 0;
            const hasDocument = !!result.finalDocument;
            console.log('\n✅ System Verification:');
            console.log(`   Financial Data: ${hasFinancialData ? '✅' : '❌'}`);
            console.log(`   News Data: ${hasNewsData ? '✅' : '❌'}`);
            console.log(`   Search Results: ${hasSearchResults ? '✅' : '❌'}`);
            console.log(`   Final Document: ${hasDocument ? '✅' : '❌'}`);
            if (hasFinancialData && hasNewsData && hasSearchResults && hasDocument) {
                console.log('\n🎊 ALL SYSTEMS WORKING PERFECTLY! 🎊');
            }
            else {
                console.log('\n⚠️  Some components may need attention');
            }
        }
        catch (error) {
            console.log('❌ Integration test failed:', error);
        }
    });
}
// Run the test
testFinalIntegration().catch(console.error);
