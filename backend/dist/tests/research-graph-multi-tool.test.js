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
function testResearchGraphWithMultiTools() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f;
        console.log('🧪 Testing Research Graph with Multi-Tool System...\n');
        const graph = (0, research_graph_1.createResearchGraph)((step, progress, details) => {
            console.log(`📊 ${step}: ${progress}% - ${details}`);
        });
        // Test 1: Financial query that should use multiple tools
        console.log('💰 Test 1: Financial Analysis Query');
        try {
            const initialState = {
                researchQuery: 'Tesla TSLA stock analysis and recent news 2024'
            };
            console.log('Starting research...');
            const result = yield graph.invoke(initialState);
            console.log('\n📋 Results Summary:');
            console.log(`- Search Results: ${((_a = result.searchResults) === null || _a === void 0 ? void 0 : _a.length) || 0} items`);
            console.log(`- Financial Data: ${((_b = result.financialData) === null || _b === void 0 ? void 0 : _b.length) || 0} items`);
            console.log(`- News Data: ${((_c = result.newsData) === null || _c === void 0 ? void 0 : _c.length) || 0} items`);
            console.log(`- Gap Search Loops: ${result.findGapLoops || 0}`);
            if (result.finalDocument) {
                console.log(`- Final Document: ${result.finalDocument.length} characters`);
                console.log('\n📄 Document Preview:');
                console.log(result.finalDocument.substring(0, 300) + '...');
            }
            console.log('\n✅ Financial analysis test completed successfully');
        }
        catch (error) {
            console.log('❌ Financial analysis test failed:', error);
        }
        // Test 2: General query that should primarily use Tavily
        console.log('\n\n🔍 Test 2: General Research Query');
        try {
            const initialState = {
                researchQuery: 'artificial intelligence machine learning trends 2024'
            };
            console.log('Starting research...');
            const result = yield graph.invoke(initialState);
            console.log('\n📋 Results Summary:');
            console.log(`- Search Results: ${((_d = result.searchResults) === null || _d === void 0 ? void 0 : _d.length) || 0} items`);
            console.log(`- Financial Data: ${((_e = result.financialData) === null || _e === void 0 ? void 0 : _e.length) || 0} items`);
            console.log(`- News Data: ${((_f = result.newsData) === null || _f === void 0 ? void 0 : _f.length) || 0} items`);
            console.log(`- Gap Search Loops: ${result.findGapLoops || 0}`);
            if (result.finalDocument) {
                console.log(`- Final Document: ${result.finalDocument.length} characters`);
            }
            console.log('\n✅ General research test completed successfully');
        }
        catch (error) {
            console.log('❌ General research test failed:', error);
        }
        console.log('\n🎉 Research Graph Multi-Tool testing completed!');
    });
}
// Run the test
testResearchGraphWithMultiTools().catch(console.error);
