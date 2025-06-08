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
const TEST_QUERIES = [
    "Can you explain how the JavaScript event loop works in detail?",
    "What's the difference between Promise.all and Promise.race in JavaScript?",
    "How does React's virtual DOM work and why is it important?",
    "Explain TypeScript decorators and their use cases"
];
function testSearchPlanner() {
    return __awaiter(this, void 0, void 0, function* () {
        const brain = new SearchPlannerBrain_1.SearchPlannerBrain();
        const query = TEST_QUERIES[Math.floor(Math.random() * TEST_QUERIES.length)];
        console.log('\n🧠 Testing SearchPlannerBrain');
        console.log('============================\n');
        console.log(`📝 Input Query: "${query}"\n`);
        try {
            const initialState = {
                findGapLoops: 0,
                researchQuery: query
            };
            console.log('⏳ Processing...\n');
            const result = yield brain.invoke(initialState);
            console.log('✅ Success!');
            console.log('------------\n');
            console.log('🔍 Search Plan:', result.searchPlan);
        }
        catch (error) {
            console.error('❌ Error:', error);
            process.exit(1);
        }
    });
}
testSearchPlanner();
