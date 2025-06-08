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
const DocumentStructureBrain_1 = require("../brains/DocumentStructureBrain");
const ContentGeneratorBrain_1 = require("../brains/ContentGeneratorBrain");
function testOllamaErrorHandling() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f;
        console.log('🧪 Testing Ollama Error Handling...\n');
        // Test data with problematic content that might cause Ollama issues
        const testSearchResults = [
            {
                title: 'Google Stock Analysis',
                url: 'https://example.com/google-analysis',
                content: 'Google stock analysis content',
                rawContent: 'This is a very long content that might cause Ollama to timeout or return undefined content. '.repeat(100),
                score: 0.9
            },
            {
                title: 'Financial Data',
                url: 'https://example.com/financial-data',
                content: 'Financial data content',
                rawContent: 'Short content',
                score: 0.8
            }
        ];
        const testState = {
            researchQuery: 'Google stock analysis test',
            searchResults: testSearchResults,
            documentStructure: '# Test Structure\n## Section 1\n## Section 2'
        };
        console.log('🔍 Testing ContentSummarizerBrain error handling...');
        try {
            const summarizer = new ContentSummarizerBrain_1.ContentSummarizerBrain();
            const summarizerResult = yield summarizer.invoke(testState);
            console.log('✅ ContentSummarizerBrain completed successfully');
            console.log(`📊 Processed ${((_a = summarizerResult.searchResults) === null || _a === void 0 ? void 0 : _a.length) || 0} results`);
            // Check that all results have summaries (either real or fallback)
            const resultsWithSummaries = ((_b = summarizerResult.searchResults) === null || _b === void 0 ? void 0 : _b.filter(r => r.summary)) || [];
            console.log(`📝 Results with summaries: ${resultsWithSummaries.length}`);
            if (resultsWithSummaries.length === testSearchResults.length) {
                console.log('✅ All results have summaries (fallbacks working)');
            }
            else {
                console.log('⚠️  Some results missing summaries');
            }
        }
        catch (error) {
            console.error('❌ ContentSummarizerBrain failed:', error);
        }
        console.log('\n🏗️  Testing DocumentStructureBrain error handling...');
        try {
            const structureGenerator = new DocumentStructureBrain_1.DocumentStructureBrain();
            const structureResult = yield structureGenerator.invoke(testState);
            console.log('✅ DocumentStructureBrain completed successfully');
            console.log(`📄 Structure length: ${((_c = structureResult.documentStructure) === null || _c === void 0 ? void 0 : _c.length) || 0} characters`);
            if (structureResult.documentStructure && structureResult.documentStructure.length > 100) {
                console.log('✅ Generated substantial structure');
            }
            else {
                console.log('⚠️  Generated minimal structure (likely fallback)');
            }
        }
        catch (error) {
            console.error('❌ DocumentStructureBrain failed:', error);
        }
        console.log('\n📝 Testing ContentGeneratorBrain error handling...');
        try {
            const contentGenerator = new ContentGeneratorBrain_1.ContentGeneratorBrain();
            const contentResult = yield contentGenerator.invoke(testState);
            console.log('✅ ContentGeneratorBrain completed successfully');
            console.log(`📄 Content length: ${((_d = contentResult.finalDocument) === null || _d === void 0 ? void 0 : _d.length) || 0} characters`);
            if (contentResult.finalDocument && contentResult.finalDocument.length > 1000) {
                console.log('✅ Generated substantial content');
            }
            else {
                console.log('⚠️  Generated minimal content (likely fallback)');
            }
            // Check for repetitive content
            if (contentResult.finalDocument) {
                const lines = contentResult.finalDocument.split('\n').filter(line => line.trim());
                const uniqueLines = new Set(lines);
                const duplicateRatio = 1 - (uniqueLines.size / lines.length);
                if (duplicateRatio < 0.5) {
                    console.log('✅ Content appears non-repetitive');
                }
                else {
                    console.log('⚠️  Content appears repetitive');
                }
            }
        }
        catch (error) {
            console.error('❌ ContentGeneratorBrain failed:', error);
        }
        console.log('\n🎯 Testing with minimal state (edge case)...');
        const minimalState = {
            researchQuery: 'Test query',
            searchResults: [{
                    title: 'Test',
                    url: 'https://test.com',
                    content: 'Test content',
                    rawContent: '',
                    score: 0.5
                }]
        };
        try {
            const summarizer = new ContentSummarizerBrain_1.ContentSummarizerBrain();
            const result = yield summarizer.invoke(minimalState);
            if ((_f = (_e = result.searchResults) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.summary) {
                console.log('✅ Minimal state handled correctly with fallback summary');
            }
            else {
                console.log('❌ Minimal state not handled properly');
            }
        }
        catch (error) {
            console.error('❌ Minimal state test failed:', error);
        }
        console.log('\n✅ Ollama error handling tests completed!');
    });
}
// Run the test
testOllamaErrorHandling();
