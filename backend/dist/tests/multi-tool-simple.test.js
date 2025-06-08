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
const SearchPlannerBrain_1 = require("../brains/SearchPlannerBrain");
const ToolExecutor_1 = require("../tools/ToolExecutor");
function testMultiToolSystem() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        console.log('🧪 Testing Multi-Tool System...\n');
        // Test 1: Search Planner with Financial Query
        console.log('📋 Test 1: Search Planner with Financial Query');
        const searchPlanner = new SearchPlannerBrain_1.SearchPlannerBrain();
        const state = {
            researchQuery: 'Apple AAPL stock analysis and recent news 2024'
        };
        try {
            const planResult = yield searchPlanner.invoke(state);
            console.log('✅ Search Plan Generated:');
            console.log(`- Tools: ${(_a = planResult.searchPlan) === null || _a === void 0 ? void 0 : _a.tools.join(', ')}`);
            console.log(`- Queries:`, (_b = planResult.searchPlan) === null || _b === void 0 ? void 0 : _b.queries);
            // Test 2: Execute the plan
            console.log('\n🚀 Test 2: Execute Tool Plan');
            const toolExecutor = new ToolExecutor_1.ToolExecutor();
            if (planResult.searchPlan) {
                const result = yield toolExecutor.executeToolPlan(planResult.searchPlan, planResult);
                console.log('\n📊 Execution Results:');
                console.log(`- Search Results: ${((_c = result.searchResults) === null || _c === void 0 ? void 0 : _c.length) || 0} items`);
                console.log(`- Financial Data: ${((_d = result.financialData) === null || _d === void 0 ? void 0 : _d.length) || 0} items`);
                console.log(`- News Data: ${((_e = result.newsData) === null || _e === void 0 ? void 0 : _e.length) || 0} items`);
                if (result.financialData && result.financialData.length > 0) {
                    console.log('\n💰 Financial Data Sample:');
                    const sample = result.financialData[0];
                    console.log(`- Symbol: ${sample.symbol}`);
                    console.log(`- Company: ${((_f = sample.quote) === null || _f === void 0 ? void 0 : _f.longName) || ((_g = sample.quote) === null || _g === void 0 ? void 0 : _g.shortName)}`);
                    console.log(`- Price: $${(_j = (_h = sample.quote) === null || _h === void 0 ? void 0 : _h.regularMarketPrice) === null || _j === void 0 ? void 0 : _j.toFixed(2)}`);
                }
                if (result.newsData && result.newsData.length > 0) {
                    console.log('\n📰 News Data Sample:');
                    const sample = result.newsData[0];
                    console.log(`- Articles: ${((_k = sample.articles) === null || _k === void 0 ? void 0 : _k.length) || 0}`);
                    if (sample.articles && sample.articles.length > 0) {
                        console.log(`- Latest: ${sample.articles[0].title}`);
                    }
                }
                console.log('\n✅ Multi-tool system test completed successfully!');
            }
        }
        catch (error) {
            console.log('❌ Test failed:', error);
        }
    });
}
// Run the test
testMultiToolSystem().catch(console.error);
