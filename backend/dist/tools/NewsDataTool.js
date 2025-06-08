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
exports.NewsDataTool = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config/config");
const logger_1 = __importDefault(require("../utils/logger"));
class NewsDataTool {
    constructor() {
        this.retryCount = 0;
        this.client = axios_1.default.create({
            baseURL: config_1.config.newsData.baseUrl,
            timeout: config_1.config.newsData.requestTimeout,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Financial-Agent/1.0'
            }
        });
    }
    delay(ms) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(resolve => setTimeout(resolve, ms));
        });
    }
    executeWithRetry(operation, context) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield operation();
                this.retryCount = 0; // Reset on success
                return result;
            }
            catch (error) {
                this.retryCount++;
                if (this.retryCount >= config_1.config.newsData.maxRetries) {
                    logger_1.default.error(`${context} failed after ${config_1.config.newsData.maxRetries} attempts:`, error);
                    throw new Error(`${context} failed after maximum retries`);
                }
                const delay = config_1.config.newsData.retryDelay * this.retryCount;
                logger_1.default.warn(`${context} failed, retrying in ${delay}ms (attempt ${this.retryCount}/${config_1.config.newsData.maxRetries})`);
                yield this.delay(delay);
                return this.executeWithRetry(operation, context);
            }
        });
    }
    buildSearchParams(query) {
        const params = {
            apikey: config_1.config.newsData.apiKey,
            language: config_1.config.newsData.defaultLanguage,
            size: config_1.config.newsData.defaultSize
        };
        // Extract keywords and build search parameters
        const keywords = this.extractKeywords(query);
        if (keywords.length > 0) {
            // Limit query length to under 100 characters for NewsData API
            let searchQuery = keywords.join(' OR ');
            if (searchQuery.length > 95) {
                // Take only the first few keywords to stay under limit
                const limitedKeywords = [];
                let currentLength = 0;
                for (const keyword of keywords) {
                    const nextLength = currentLength + keyword.length + (limitedKeywords.length > 0 ? 4 : 0); // +4 for " OR "
                    if (nextLength > 95)
                        break;
                    limitedKeywords.push(keyword);
                    currentLength = nextLength;
                }
                searchQuery = limitedKeywords.join(' OR ');
            }
            params.q = searchQuery;
        }
        // Check for specific categories in the query
        const category = this.detectCategory(query);
        if (category) {
            params.category = category;
        }
        // Check for country-specific queries
        const country = this.detectCountry(query);
        if (country) {
            params.country = country;
        }
        // Check for time-sensitive queries
        const timeRange = this.detectTimeRange(query);
        if (timeRange) {
            params.from_date = timeRange.from;
            params.to_date = timeRange.to;
        }
        return params;
    }
    extractKeywords(query) {
        // Remove common stop words and extract meaningful keywords
        const stopWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'about', 'news', 'latest', 'recent'];
        const words = query.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 2 && !stopWords.includes(word));
        return [...new Set(words)]; // Remove duplicates
    }
    detectCategory(query) {
        const categoryMap = {
            'business': 'business',
            'technology': 'technology',
            'tech': 'technology',
            'sports': 'sports',
            'entertainment': 'entertainment',
            'health': 'health',
            'science': 'science',
            'politics': 'politics',
            'world': 'world',
            'environment': 'environment',
            'food': 'food',
            'tourism': 'tourism'
        };
        const lowerQuery = query.toLowerCase();
        for (const [keyword, category] of Object.entries(categoryMap)) {
            if (lowerQuery.includes(keyword)) {
                return category;
            }
        }
        return undefined;
    }
    detectCountry(query) {
        const countryMap = {
            'usa': 'us',
            'united states': 'us',
            'america': 'us',
            'uk': 'gb',
            'britain': 'gb',
            'england': 'gb',
            'canada': 'ca',
            'australia': 'au',
            'germany': 'de',
            'france': 'fr',
            'japan': 'jp',
            'china': 'cn',
            'india': 'in',
            'brazil': 'br',
            'russia': 'ru',
            'spain': 'es',
            'italy': 'it'
        };
        const lowerQuery = query.toLowerCase();
        for (const [keyword, countryCode] of Object.entries(countryMap)) {
            if (lowerQuery.includes(keyword)) {
                return countryCode;
            }
        }
        return undefined;
    }
    detectTimeRange(query) {
        const today = new Date();
        const lowerQuery = query.toLowerCase();
        if (lowerQuery.includes('today')) {
            const todayStr = today.toISOString().split('T')[0];
            return { from: todayStr, to: todayStr };
        }
        if (lowerQuery.includes('yesterday')) {
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            return { from: yesterdayStr, to: yesterdayStr };
        }
        if (lowerQuery.includes('last week') || lowerQuery.includes('past week')) {
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return {
                from: weekAgo.toISOString().split('T')[0],
                to: today.toISOString().split('T')[0]
            };
        }
        if (lowerQuery.includes('last month') || lowerQuery.includes('past month')) {
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return {
                from: monthAgo.toISOString().split('T')[0],
                to: today.toISOString().split('T')[0]
            };
        }
        return undefined;
    }
    fetchNews(endpoint, params) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.executeWithRetry(() => __awaiter(this, void 0, void 0, function* () {
                const response = yield this.client.get(`/${endpoint}`, {
                    params: params
                });
                if (response.data.status !== 'success') {
                    throw new Error(`NewsData API error: ${response.data.status}`);
                }
                return response.data;
            }), `Fetch news from ${endpoint}`);
        });
    }
    generateNewsSummary(newsData) {
        const { articles, totalResults } = newsData;
        if (!articles || articles.length === 0) {
            return 'No news articles found for the given query.';
        }
        let summary = `Found ${totalResults} news articles. Here are the top ${articles.length} results:\n\n`;
        articles.slice(0, 5).forEach((article, index) => {
            summary += `${index + 1}. ${article.title}\n`;
            summary += `   Source: ${article.source_id}\n`;
            summary += `   Published: ${new Date(article.pubDate).toLocaleDateString()}\n`;
            if (article.description) {
                summary += `   Summary: ${article.description.substring(0, 150)}${article.description.length > 150 ? '...' : ''}\n`;
            }
            if (article.category && article.category.length > 0) {
                summary += `   Categories: ${article.category.join(', ')}\n`;
            }
            summary += `   URL: ${article.link}\n\n`;
        });
        if (articles.length > 5) {
            summary += `... and ${articles.length - 5} more articles.\n`;
        }
        // Add category breakdown
        const categories = articles.reduce((acc, article) => {
            var _a;
            (_a = article.category) === null || _a === void 0 ? void 0 : _a.forEach(cat => {
                acc[cat] = (acc[cat] || 0) + 1;
            });
            return acc;
        }, {});
        if (Object.keys(categories).length > 0) {
            summary += `\nCategory breakdown:\n`;
            Object.entries(categories)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .forEach(([category, count]) => {
                summary += `- ${category}: ${count} articles\n`;
            });
        }
        return summary;
    }
    invoke(state) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (!state.searchPlan) {
                throw new Error('No search plan available for news data retrieval');
            }
            // Handle both old string format and new ToolPlan format for backward compatibility
            let query;
            if (typeof state.searchPlan === 'string') {
                query = state.searchPlan;
            }
            else {
                query = state.searchPlan.queries['NEWSDATA'] || Object.values(state.searchPlan.queries)[0] || '';
            }
            if (!query) {
                throw new Error('No query available for NewsData search');
            }
            if (!config_1.config.newsData.apiKey) {
                throw new Error('NewsData API key not configured');
            }
            this.retryCount = 0;
            const newsDataResults = [];
            try {
                logger_1.default.info('Starting news data retrieval with NewsData.io');
                // Build search parameters from the query
                const searchParams = this.buildSearchParams(query);
                // Determine the best endpoint based on the query
                const endpoint = this.detectTimeRange(query) ? 'archive' : config_1.config.newsData.defaultEndpoint;
                logger_1.default.info(`Using endpoint: ${endpoint} with params:`, searchParams);
                // Fetch news data
                const response = yield this.fetchNews(endpoint, searchParams);
                if (response.results && response.results.length > 0) {
                    const newsData = {
                        articles: response.results,
                        totalResults: response.totalResults,
                        nextPage: response.nextPage,
                        searchParams
                    };
                    newsData.summary = this.generateNewsSummary(newsData);
                    newsDataResults.push(newsData);
                    logger_1.default.info(`Successfully retrieved ${response.results.length} news articles`);
                }
                else {
                    logger_1.default.warn('No news articles found for the given query');
                }
            }
            catch (error) {
                logger_1.default.error('Error in NewsData tool:', error);
                // Check if it's an API key error
                if (axios_1.default.isAxiosError(error) && ((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 401) {
                    logger_1.default.warn('Invalid NewsData API key, returning empty results');
                    return Object.assign(Object.assign({}, state), { newsData: [] });
                }
                // Check if it's a rate limit error
                if (axios_1.default.isAxiosError(error) && ((_b = error.response) === null || _b === void 0 ? void 0 : _b.status) === 429) {
                    logger_1.default.warn('NewsData API rate limit exceeded, returning empty results');
                    return Object.assign(Object.assign({}, state), { newsData: [] });
                }
                // For other errors, return empty results instead of throwing
                logger_1.default.warn('NewsData API error, returning empty results:', error instanceof Error ? error.message : String(error));
                return Object.assign(Object.assign({}, state), { newsData: [] });
            }
            return Object.assign(Object.assign({}, state), { newsData: newsDataResults });
        });
    }
}
exports.NewsDataTool = NewsDataTool;
