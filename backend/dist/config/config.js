"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    cors: {
        origins: ((_a = process.env.CORS_ORIGINS) === null || _a === void 0 ? void 0 : _a.split(',')) || ['http://localhost:3000'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    },
    logs: {
        level: process.env.LOG_LEVEL || 'info',
    },
    api: {
        prefix: '/api/v1',
    },
    ws: {
        path: '/api/v1/ws/research'
    },
    llm: {
        thinkingModel: process.env.THINKING_MODEL || 'deepseek-r1:8b',
        generatingModel: process.env.GENERATING_MODEL || 'qwen2.5:7b',
        ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
        contentGeneratorMaxTokens: parseInt(process.env.CONTENT_GENERATOR_MAX_TOKENS || '5000', 10)
    },
    tavily: {
        apiKey: process.env.TAVILY_API_KEY || '',
        initialResults: parseInt(process.env.TAVILY_INITIAL_RESULTS || '3', 10),
        maxRetries: parseInt(process.env.TAVILY_MAX_RETRIES || '3', 10)
    },
    yahooFinance: {
        maxRetries: parseInt(process.env.YAHOO_FINANCE_MAX_RETRIES || '3', 10),
        retryDelay: parseInt(process.env.YAHOO_FINANCE_RETRY_DELAY || '1000', 10),
        requestTimeout: parseInt(process.env.YAHOO_FINANCE_REQUEST_TIMEOUT || '10000', 10),
        maxSymbolsPerRequest: parseInt(process.env.YAHOO_FINANCE_MAX_SYMBOLS || '10', 10),
        historicalDataPeriod: process.env.YAHOO_FINANCE_HISTORICAL_PERIOD || '1y'
    },
    newsData: {
        apiKey: process.env.NEWSDATA_API_KEY || '',
        baseUrl: 'https://newsdata.io/api/1',
        maxRetries: parseInt(process.env.NEWSDATA_MAX_RETRIES || '3', 10),
        retryDelay: parseInt(process.env.NEWSDATA_RETRY_DELAY || '1000', 10),
        requestTimeout: parseInt(process.env.NEWSDATA_REQUEST_TIMEOUT || '10000', 10),
        defaultSize: parseInt(process.env.NEWSDATA_DEFAULT_SIZE || '10', 10),
        maxSize: parseInt(process.env.NEWSDATA_MAX_SIZE || '50', 10),
        defaultLanguage: process.env.NEWSDATA_DEFAULT_LANGUAGE || 'en',
        defaultEndpoint: process.env.NEWSDATA_DEFAULT_ENDPOINT || 'latest'
    },
    research: {
        maxGapLoops: parseInt(process.env.MAX_GAP_LOOPS || '2', 10)
    },
    rateLimiter: {
        windowMs: 15 * 60 * 1000,
        max: 100,
    }
};
