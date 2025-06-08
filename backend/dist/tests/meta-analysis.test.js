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
function testMetaAnalysis() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        console.log('🧪 Testing Meta Analysis with Error Handling...\n');
        const initialState = {
            researchQuery: 'Meta market trends'
        };
        let currentStep = '';
        let currentProgress = 0;
        const graph = (0, research_graph_1.createResearchGraph)((step, progress, details) => {
            currentStep = step;
            currentProgress = progress;
            console.log(`📊 Step: ${step} (${progress}%) - ${details}`);
        });
        try {
            console.log('🚀 Starting Meta analysis...\n');
            const result = yield graph.invoke(initialState);
            console.log('\n✅ Analysis completed successfully!');
            console.log(`Final document length: ${((_a = result.finalDocument) === null || _a === void 0 ? void 0 : _a.length) || 0} characters`);
            if (result.finalDocument) {
                console.log('\n📄 Document preview:');
                console.log(result.finalDocument.substring(0, 500) + '...');
            }
            console.log('\n📊 Final state:');
            console.log(`- Search results: ${((_b = result.searchResults) === null || _b === void 0 ? void 0 : _b.length) || 0}`);
            console.log(`- Financial data: ${((_c = result.financialData) === null || _c === void 0 ? void 0 : _c.length) || 0}`);
            console.log(`- News data: ${((_d = result.newsData) === null || _d === void 0 ? void 0 : _d.length) || 0}`);
            console.log(`- Gap loops: ${result.findGapLoops || 0}`);
        }
        catch (error) {
            console.error('\n❌ Analysis failed:');
            console.error(`Current step: ${currentStep}`);
            console.error(`Progress: ${currentProgress}%`);
            console.error('Error:', error);
            if (error instanceof Error) {
                console.error('Stack:', error.stack);
            }
        }
    });
}
// Run the test
testMetaAnalysis();
