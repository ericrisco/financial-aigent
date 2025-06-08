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
const TEST_STATE = {
    findGapLoops: 0,
    researchQuery: "How does the JavaScript event loop work?",
    searchResults: [
        {
            title: "Understanding the JavaScript Event Loop",
            url: "https://example.com/js-event-loop",
            content: "Brief preview of the content...",
            rawContent: `The JavaScript event loop is a fundamental concept in JavaScript's concurrency model. 
      It's responsible for executing code, collecting and processing events, and executing queued sub-tasks. 
      The event loop continuously checks the call stack and the callback queue. 
      When the call stack is empty, it takes the first event from the queue and pushes it to the call stack, which effectively runs it.
      This process is what makes JavaScript's asynchronous programming possible.
      The event loop works in conjunction with the call stack and the callback queue to handle asynchronous operations.
      When an async operation completes, its callback is placed in the callback queue.
      The event loop constantly checks if the call stack is empty, and if it is, it pushes the next callback from the queue to the stack.`,
            score: 0.95
        },
        {
            title: "Deep Dive into JavaScript Runtime",
            url: "https://example.com/js-runtime",
            content: "Brief preview of the content...",
            rawContent: `JavaScript runtime consists of several key components working together.
      The heap is where memory allocation happens for objects.
      The call stack is where function calls are tracked.
      Web APIs provide additional functionality like setTimeout, DOM events, and HTTP requests.
      The callback queue (also known as the task queue) holds callbacks waiting to be executed.
      The microtask queue has higher priority than the callback queue and is used for Promises.
      The event loop orchestrates all these components to make asynchronous JavaScript work smoothly.
      Understanding these concepts is crucial for writing efficient JavaScript code.`,
            score: 0.88
        }
    ]
};
function testContentSummarizer() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const brain = new ContentSummarizerBrain_1.ContentSummarizerBrain();
        console.log('\n🧠 Testing ContentSummarizerBrain');
        console.log('==============================\n');
        console.log(`📝 Research Query: "${TEST_STATE.researchQuery}"\n`);
        console.log(`📚 Processing ${(_a = TEST_STATE.searchResults) === null || _a === void 0 ? void 0 : _a.length} articles...\n`);
        try {
            console.log('⏳ Generating summaries in parallel...\n');
            const result = yield brain.invoke(TEST_STATE);
            console.log('✅ Success!');
            console.log('------------\n');
            (_b = result.searchResults) === null || _b === void 0 ? void 0 : _b.forEach((res, index) => {
                console.log(`Article ${index + 1}:`);
                console.log(`🔗 ${res.url}`);
                console.log(`📖 ${res.title}`);
                console.log(`📝 Summary:`);
                console.log(res.summary);
                console.log();
            });
        }
        catch (error) {
            console.error('❌ Error:', error);
            process.exit(1);
        }
    });
}
testContentSummarizer();
