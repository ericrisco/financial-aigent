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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeepResearchService = void 0;
const research_graph_1 = require("../graph/research.graph");
const logger_1 = __importDefault(require("../utils/logger"));
class DeepResearchService {
    sendMessage(ws, step, progress, details, query, completion = "") {
        const message = {
            step,
            timestamp: new Date().toISOString(),
            progress,
            details,
            query,
            completion
        };
        ws.send(JSON.stringify(message));
        logger_1.default.info(`Research step: ${step}`, { progress, details, query });
    }
    startResearch(ws, query) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const progressCallback = (step, progress, details) => {
                    this.sendMessage(ws, step, progress, details, query);
                };
                const graph = (0, research_graph_1.createResearchGraph)(progressCallback);
                const initialState = {
                    researchQuery: query,
                    findGapLoops: 0
                };
                // Execute graph with increased recursion limit
                const finalState = yield graph.invoke(initialState, {
                    recursionLimit: 50
                });
                // Send completion message
                this.sendMessage(ws, "complete", 100, `Research completed with ${((_a = finalState.searchResults) === null || _a === void 0 ? void 0 : _a.length) || 0} sources and ${finalState.findGapLoops} search iterations`, query, finalState.finalDocument);
            }
            catch (error) {
                logger_1.default.error('Error in research process:', error);
                this.sendMessage(ws, "error", 0, error instanceof Error ? error.message : 'Unknown error occurred', query);
            }
        });
    }
}
exports.DeepResearchService = DeepResearchService;
