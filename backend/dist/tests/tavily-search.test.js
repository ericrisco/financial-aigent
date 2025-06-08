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
const TavilySearchTool_1 = require("../tools/TavilySearchTool");
const TEST_SEARCH_PLANS = [
    "JavaScript event loop implementation event-driven programming asynchronous execution call stack",
    "JavaScript Promise.all Promise.race concurrent promise handling parallel execution",
    "React Virtual DOM rendering optimization diffing algorithm performance benefits",
    "TypeScript decorators metadata reflection design patterns implementation examples"
];
function testTavilySearch() {
    return __awaiter(this, void 0, void 0, function* () {
        const tool = new TavilySearchTool_1.TavilySearchTool();
        const searchPlan = TEST_SEARCH_PLANS[Math.floor(Math.random() * TEST_SEARCH_PLANS.length)];
        console.log('\n🔍 Testing TavilySearchTool');
        console.log('=========================\n');
        console.log(`📝 Search Plan: "${searchPlan}"\n`);
        try {
            const initialState = {
                findGapLoops: 0,
                researchQuery: "original query",
                searchPlan: searchPlan
            };
            console.log('⏳ Searching...\n');
            const result = yield tool.invoke(initialState);
            console.log('✅ Success!');
            console.log('------------\n');
            if (result.searchResults) {
                console.log(`Found ${result.searchResults.length} results:\n`);
                result.searchResults.forEach((res, index) => {
                    console.log(`Result ${index + 1}:`);
                    console.log(`🔗 ${res.url}`);
                    console.log(`📖 ${res.title}`);
                    console.log(`🎯 Score: ${res.score}`);
                    console.log(`📄 Content Preview: ${res.content.substring(0, 150)}...\n`);
                });
            }
        }
        catch (error) {
            console.error('❌ Error:', error);
            process.exit(1);
        }
    });
}
testTavilySearch();
