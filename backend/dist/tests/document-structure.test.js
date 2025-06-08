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
const DocumentStructureBrain_1 = require("../brains/DocumentStructureBrain");
const TEST_STATE = {
    findGapLoops: 0,
    researchQuery: "How does the JavaScript event loop work?",
    searchResults: [
        {
            title: "Understanding the JavaScript Event Loop",
            url: "https://example.com/js-event-loop",
            content: "Brief preview...",
            rawContent: "Full content...",
            score: 0.95,
            summary: `The JavaScript event loop is a core mechanism that enables asynchronous programming. 
      It continuously monitors the call stack and callback queue, moving callbacks to the stack when it's empty. 
      This process is fundamental to handling async operations in JavaScript.`
        },
        {
            title: "JavaScript Runtime Components",
            url: "https://example.com/js-runtime",
            content: "Brief preview...",
            rawContent: "Full content...",
            score: 0.88,
            summary: `The JavaScript runtime includes several key components: the heap for memory allocation, 
      the call stack for tracking function calls, and the callback queue for managing async operations. 
      The event loop orchestrates these components to handle asynchronous code execution.`
        }
    ]
};
function testDocumentStructure() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const brain = new DocumentStructureBrain_1.DocumentStructureBrain();
        console.log('\n📝 Testing DocumentStructureBrain');
        console.log('==============================\n');
        console.log(`📚 Topic: "${TEST_STATE.researchQuery}"\n`);
        console.log('Available Information:');
        (_a = TEST_STATE.searchResults) === null || _a === void 0 ? void 0 : _a.forEach((result, index) => {
            console.log(`\nSource ${index + 1}:`);
            console.log(result.summary);
        });
        console.log('\n');
        try {
            console.log('⏳ Generating document structure...\n');
            const result = yield brain.invoke(TEST_STATE);
            console.log('✅ Structure Generated!');
            console.log('=====================\n');
            if (result.documentStructure) {
                console.log('📋 Document Structure:');
                console.log('-------------------\n');
                console.log(result.documentStructure);
            }
            else {
                console.log('❌ No structure generated');
            }
        }
        catch (error) {
            console.error('❌ Error:', error);
            process.exit(1);
        }
    });
}
testDocumentStructure();
