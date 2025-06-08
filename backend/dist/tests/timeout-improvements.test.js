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
const ContentSummarizerBrain_1 = require("../brains/ContentSummarizerBrain");
function testTimeoutImprovements() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        console.log('🧪 Testing Timeout Improvements...\n');
        // Create test data with large content that might cause timeouts
        const largeContent = 'This is a very long piece of content that might cause Ollama to timeout. '.repeat(1000);
        const testSearchResults = [
            {
                title: 'Large Content Test 1',
                url: 'https://example.com/large-content-1',
                content: 'Large content summary',
                rawContent: largeContent,
                score: 0.9
            },
            {
                title: 'Large Content Test 2',
                url: 'https://example.com/large-content-2',
                content: 'Large content summary',
                rawContent: largeContent,
                score: 0.8
            }
        ];
        const testState = {
            researchQuery: 'Timeout test analysis',
            searchResults: testSearchResults
        };
        console.log('📊 Test Configuration:');
        console.log(`- Content length per result: ${largeContent.length} characters`);
        console.log(`- Number of results: ${testSearchResults.length}`);
        console.log(`- Max concurrency: 2 (reduced from 3)`);
        console.log(`- Timeout per request: 60 seconds`);
        console.log(`- Retry attempts: 3 per request`);
        console.log(`- Delay between batches: 2 seconds`);
        const summarizer = new ContentSummarizerBrain_1.ContentSummarizerBrain();
        const startTime = Date.now();
        try {
            console.log('\n🚀 Starting timeout-resilient summarization...');
            const result = yield summarizer.invoke(testState);
            const endTime = Date.now();
            const duration = (endTime - startTime) / 1000;
            console.log('\n✅ Summarization completed successfully!');
            console.log(`⏱️  Total duration: ${duration.toFixed(2)} seconds`);
            console.log(`📄 Results processed: ${((_a = result.searchResults) === null || _a === void 0 ? void 0 : _a.length) || 0}`);
            // Check if all results have summaries
            const resultsWithSummaries = ((_b = result.searchResults) === null || _b === void 0 ? void 0 : _b.filter(r => r.summary)) || [];
            console.log(`📝 Results with summaries: ${resultsWithSummaries.length}`);
            if (resultsWithSummaries.length === testSearchResults.length) {
                console.log('🎉 All results successfully summarized!');
            }
            else {
                console.log('⚠️  Some results may have used fallback summaries');
            }
            // Show summary lengths
            (_c = result.searchResults) === null || _c === void 0 ? void 0 : _c.forEach((result, index) => {
                var _a;
                const summaryLength = ((_a = result.summary) === null || _a === void 0 ? void 0 : _a.length) || 0;
                console.log(`  Result ${index + 1}: ${summaryLength} characters`);
            });
        }
        catch (error) {
            const endTime = Date.now();
            const duration = (endTime - startTime) / 1000;
            console.error('\n❌ Timeout test failed:');
            console.error(`⏱️  Duration before failure: ${duration.toFixed(2)} seconds`);
            console.error('Error:', error);
        }
        console.log('\n📋 Timeout Improvements Summary:');
        console.log('✅ Reduced concurrency from 3 to 2');
        console.log('✅ Increased timeout from 30s to 60s');
        console.log('✅ Increased batch delay from 0.5s to 2s');
        console.log('✅ Increased retry delay with exponential backoff');
        console.log('✅ Enhanced fallback mechanisms');
    });
}
// Run the test
testTimeoutImprovements();
