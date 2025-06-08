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
const TEST_QUERIES = [
    "How does the JavaScript event loop work?",
    "What are JavaScript Promises and how do they work?",
    "Explain React's Virtual DOM and reconciliation process",
    "What is TypeScript and how does it enhance JavaScript?"
];
function testResearchGraph() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const graph = (0, research_graph_1.createResearchGraph)();
        const query = TEST_QUERIES[Math.floor(Math.random() * TEST_QUERIES.length)];
        console.log('\n🔬 Testing Research Graph');
        console.log('=======================\n');
        console.log(`📝 Research Query: "${query}"\n`);
        try {
            const initialState = {
                researchQuery: query,
                findGapLoops: 0
            };
            console.log('⚡ Starting research process...\n');
            const result = yield graph.invoke(initialState);
            console.log('\n✅ Research Complete!');
            console.log('===================\n');
            console.log('📊 Research Statistics:');
            console.log('--------------------');
            console.log(`🔄 Gap Search Loops: ${result.findGapLoops}`);
            console.log(`🔍 Search Results: ${((_a = result.searchResults) === null || _a === void 0 ? void 0 : _a.length) || 0}`);
            console.log(`📑 Document Structure Length: ${((_b = result.documentStructure) === null || _b === void 0 ? void 0 : _b.split('\n').length) || 0} lines`);
            console.log(`📚 Final Document Length: ${((_c = result.finalDocument) === null || _c === void 0 ? void 0 : _c.split('\n').length) || 0} lines\n`);
            console.log('📄 Final Document Preview:');
            console.log('----------------------\n');
            if (result.finalDocument) {
                // Show first 20 lines of the document
                console.log(result.finalDocument.split('\n').slice(0, 20).join('\n'));
                console.log('\n... (truncated for brevity)');
            }
            else {
                console.log('❌ No document generated');
            }
        }
        catch (error) {
            console.error('❌ Error:', error);
            process.exit(1);
        }
    });
}
testResearchGraph();
