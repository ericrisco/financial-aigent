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
function testRecursionFix() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        console.log('🧪 Testing Recursion Fix...\n');
        const initialState = {
            researchQuery: 'Google stock analysis'
        };
        let stepCount = 0;
        let lastStep = '';
        const stepHistory = [];
        const graph = (0, research_graph_1.createResearchGraph)((step, progress, details) => {
            stepCount++;
            lastStep = step;
            stepHistory.push(`${stepCount}: ${step} (${progress}%)`);
            console.log(`📊 Step ${stepCount}: ${step} (${progress}%) - ${details}`);
            // Safety check - if we get too many steps, something is wrong
            if (stepCount > 20) {
                console.error('❌ Too many steps detected, possible infinite loop!');
                throw new Error('Test safety limit reached');
            }
        });
        const startTime = Date.now();
        try {
            console.log('🚀 Starting analysis with recursion protection...\n');
            const result = yield graph.invoke(initialState);
            const endTime = Date.now();
            const duration = (endTime - startTime) / 1000;
            console.log('\n✅ Analysis completed successfully!');
            console.log(`⏱️  Duration: ${duration.toFixed(2)} seconds`);
            console.log(`🔄 Total steps: ${stepCount}`);
            console.log(`📄 Final document length: ${((_a = result.finalDocument) === null || _a === void 0 ? void 0 : _a.length) || 0} characters`);
            console.log('\n📊 Step History:');
            stepHistory.forEach(step => console.log(`  ${step}`));
            console.log('\n📈 Final State Summary:');
            console.log(`- Search results: ${((_b = result.searchResults) === null || _b === void 0 ? void 0 : _b.length) || 0}`);
            console.log(`- Financial data: ${((_c = result.financialData) === null || _c === void 0 ? void 0 : _c.length) || 0}`);
            console.log(`- News data: ${((_d = result.newsData) === null || _d === void 0 ? void 0 : _d.length) || 0}`);
            console.log(`- Gap loops: ${result.findGapLoops || 0}`);
            console.log(`- Has final document: ${!!result.finalDocument}`);
            // Validate that we didn't get stuck in a loop
            if (stepCount <= 15) {
                console.log('\n✅ Recursion test PASSED - Normal step count');
            }
            else {
                console.log('\n⚠️  High step count but completed successfully');
            }
            if (result.finalDocument && result.finalDocument.length > 1000) {
                console.log('✅ Content generation test PASSED - Substantial content generated');
            }
            else {
                console.log('⚠️  Content generation test - Limited content');
            }
        }
        catch (error) {
            const endTime = Date.now();
            const duration = (endTime - startTime) / 1000;
            console.error('\n❌ Analysis failed:');
            console.error(`⏱️  Duration before failure: ${duration.toFixed(2)} seconds`);
            console.error(`🔄 Steps completed: ${stepCount}`);
            console.error(`📍 Last step: ${lastStep}`);
            console.error('Error:', error);
            console.log('\n📊 Step History before failure:');
            stepHistory.forEach(step => console.log(`  ${step}`));
            if (error instanceof Error && error.message.includes('Recursion limit')) {
                console.error('\n🔄 RECURSION LIMIT ERROR - This indicates the fix may not be working properly');
            }
        }
    });
}
// Run the test
testRecursionFix();
