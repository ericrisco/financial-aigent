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
exports.ToolExecutor = void 0;
const TavilySearchTool_1 = require("./TavilySearchTool");
const YahooFinanceTool_1 = require("./YahooFinanceTool");
const NewsDataTool_1 = require("./NewsDataTool");
const logger_1 = __importDefault(require("../utils/logger"));
class ToolExecutor {
    constructor() {
        this.tavilyTool = new TavilySearchTool_1.TavilySearchTool();
        this.yahooFinanceTool = new YahooFinanceTool_1.YahooFinanceTool();
        this.newsDataTool = new NewsDataTool_1.NewsDataTool();
    }
    executeTavily(query, state) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.info(`Executing Tavily search: ${query}`);
            const tempState = Object.assign(Object.assign({}, state), { searchPlan: { tools: ['TAVILY'], queries: { TAVILY: query } } });
            const result = yield this.tavilyTool.invoke(tempState);
            return { searchResults: result.searchResults };
        });
    }
    executeYahooFinance(query, state) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.info(`Executing Yahoo Finance search: ${query}`);
            const tempState = Object.assign(Object.assign({}, state), { searchPlan: { tools: ['YAHOO_FINANCE'], queries: { YAHOO_FINANCE: query } } });
            const result = yield this.yahooFinanceTool.invoke(tempState);
            return { financialData: result.financialData };
        });
    }
    executeNewsData(query, state) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.info(`Executing NewsData search: ${query}`);
            const tempState = Object.assign(Object.assign({}, state), { searchPlan: { tools: ['NEWSDATA'], queries: { NEWSDATA: query } } });
            const result = yield this.newsDataTool.invoke(tempState);
            return { newsData: result.newsData };
        });
    }
    convertFinancialDataToSearchResults(financialData) {
        if (!financialData || financialData.length === 0)
            return [];
        return financialData.map((data, index) => {
            var _a, _b;
            return ({
                title: `${((_a = data.quote) === null || _a === void 0 ? void 0 : _a.longName) || ((_b = data.quote) === null || _b === void 0 ? void 0 : _b.shortName) || data.symbol} Financial Data`,
                url: `https://finance.yahoo.com/quote/${data.symbol}`,
                content: data.summary || `Financial data for ${data.symbol}`,
                rawContent: data.summary || `Financial data for ${data.symbol}`,
                score: 0.9,
                summary: data.summary
            });
        });
    }
    convertNewsDataToSearchResults(newsData) {
        if (!newsData || newsData.length === 0)
            return [];
        const results = [];
        newsData.forEach(data => {
            if (data.articles && data.articles.length > 0) {
                data.articles.slice(0, 5).forEach((article) => {
                    results.push({
                        title: article.title,
                        url: article.link,
                        content: article.description || article.title,
                        rawContent: article.description || article.title,
                        score: 0.8,
                        summary: article.description
                    });
                });
            }
        });
        return results;
    }
    executeToolPlan(toolPlan, state) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = [];
            const allSearchResults = [];
            // Execute all tools in parallel
            const toolPromises = toolPlan.tools.map((tool) => __awaiter(this, void 0, void 0, function* () {
                const query = toolPlan.queries[tool];
                if (!query) {
                    logger_1.default.warn(`No query found for tool: ${tool}`);
                    return {};
                }
                try {
                    switch (tool) {
                        case 'TAVILY':
                            return yield this.executeTavily(query, state);
                        case 'YAHOO_FINANCE':
                            return yield this.executeYahooFinance(query, state);
                        case 'NEWSDATA':
                            return yield this.executeNewsData(query, state);
                        default:
                            logger_1.default.warn(`Unknown tool: ${tool}`);
                            return {};
                    }
                }
                catch (error) {
                    logger_1.default.error(`Error executing tool ${tool}:`, error);
                    return {};
                }
            }));
            const toolResults = yield Promise.all(toolPromises);
            // Combine all results
            let combinedFinancialData = state.financialData || [];
            let combinedNewsData = state.newsData || [];
            toolResults.forEach(result => {
                if (result.searchResults) {
                    allSearchResults.push(...result.searchResults);
                }
                if (result.financialData) {
                    combinedFinancialData = [...combinedFinancialData, ...result.financialData];
                    // Convert financial data to search results for unified processing
                    allSearchResults.push(...this.convertFinancialDataToSearchResults(result.financialData));
                }
                if (result.newsData) {
                    combinedNewsData = [...combinedNewsData, ...result.newsData];
                    // Convert news data to search results for unified processing
                    allSearchResults.push(...this.convertNewsDataToSearchResults(result.newsData));
                }
            });
            logger_1.default.info(`Tool execution completed. Total results: ${allSearchResults.length}`);
            return Object.assign(Object.assign({}, state), { searchResults: allSearchResults, financialData: combinedFinancialData, newsData: combinedNewsData });
        });
    }
}
exports.ToolExecutor = ToolExecutor;
