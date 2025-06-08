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
exports.TavilySearchTool = void 0;
const core_1 = require("@tavily/core");
const config_1 = require("../config/config");
const logger_1 = __importDefault(require("../utils/logger"));
class TavilySearchTool {
    constructor() {
        this.retryCount = 0;
        this.client = (0, core_1.tavily)({ apiKey: config_1.config.tavily.apiKey });
    }
    searchWithRetry(query, maxResults) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.client.search(query, {
                    searchDepth: 'advanced',
                    maxResults,
                    includeRawContent: true
                });
                if (!response.results || response.results.length === 0) {
                    this.retryCount++;
                    if (this.retryCount >= config_1.config.tavily.maxRetries) {
                        throw new Error(`No results found after ${config_1.config.tavily.maxRetries} attempts`);
                    }
                    logger_1.default.info(`No results found, retrying with ${maxResults * 2} results...`);
                    return this.searchWithRetry(query, maxResults * 2);
                }
                return response.results.map((result) => ({
                    title: result.title,
                    url: result.url,
                    content: result.content,
                    rawContent: result.rawContent || '',
                    score: result.score
                }));
            }
            catch (error) {
                if (error instanceof Error && error.message.includes('No results found')) {
                    throw error;
                }
                logger_1.default.error('Error searching with Tavily:', error);
                throw new Error('Failed to perform search');
            }
        });
    }
    invoke(state) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!state.searchPlan) {
                throw new Error('No search plan available');
            }
            // Handle both old string format and new ToolPlan format for backward compatibility
            let query;
            if (typeof state.searchPlan === 'string') {
                query = state.searchPlan;
            }
            else {
                query = state.searchPlan.queries['TAVILY'] || Object.values(state.searchPlan.queries)[0] || '';
            }
            if (!query) {
                throw new Error('No query available for Tavily search');
            }
            this.retryCount = 0;
            const results = yield this.searchWithRetry(query, config_1.config.tavily.initialResults);
            return Object.assign(Object.assign({}, state), { searchResults: results });
        });
    }
}
exports.TavilySearchTool = TavilySearchTool;
