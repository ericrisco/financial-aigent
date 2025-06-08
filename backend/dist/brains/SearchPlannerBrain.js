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
exports.SearchPlannerBrain = void 0;
const ollama_1 = require("@langchain/community/chat_models/ollama");
const config_1 = require("../config/config");
const search_planner_prompt_1 = require("./prompts/search-planner.prompt");
const text_utils_1 = require("../utils/text.utils");
const prompts_1 = require("@langchain/core/prompts");
const ollama_health_1 = require("../utils/ollama-health");
const logger_1 = __importDefault(require("../utils/logger"));
class SearchPlannerBrain {
    constructor() {
        this.model = new ollama_1.ChatOllama({
            baseUrl: config_1.config.llm.ollamaBaseUrl,
            model: config_1.config.llm.thinkingModel,
            temperature: 0
        });
        this.prompt = prompts_1.PromptTemplate.fromTemplate(search_planner_prompt_1.SEARCH_PLANNER_PROMPT);
        this.healthChecker = new ollama_health_1.OllamaHealthChecker();
    }
    parseToolPlan(response) {
        try {
            let cleanResponse = (0, text_utils_1.removeThinkingTags)(response.trim());
            // Remove markdown code blocks if present
            cleanResponse = cleanResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '');
            // Try to extract JSON from the response if it's mixed with text
            const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                cleanResponse = jsonMatch[0];
            }
            const parsed = JSON.parse(cleanResponse);
            if (!parsed.tools || !Array.isArray(parsed.tools) || !parsed.queries) {
                throw new Error('Invalid tool plan structure');
            }
            return {
                tools: parsed.tools,
                queries: parsed.queries
            };
        }
        catch (error) {
            logger_1.default.error('Failed to parse tool plan, falling back to Tavily only:', error);
            logger_1.default.info('Raw response was:', response.substring(0, 200) + '...');
            // Fallback to Tavily with the original query
            return {
                tools: ['TAVILY'],
                queries: {
                    'TAVILY': response.trim()
                }
            };
        }
    }
    generateFallbackPlan(query) {
        // Analyze query to determine best tools
        const lowerQuery = query.toLowerCase();
        const tools = ['TAVILY']; // Always include web search
        const queries = {
            'TAVILY': query
        };
        // Add financial data if query seems financial
        if (lowerQuery.includes('stock') || lowerQuery.includes('financial') ||
            lowerQuery.includes('earnings') || lowerQuery.includes('market') ||
            lowerQuery.includes('investment') || lowerQuery.includes('analysis')) {
            tools.push('YAHOO_FINANCE');
            queries['YAHOO_FINANCE'] = query;
        }
        // Add news if query seems news-related
        if (lowerQuery.includes('news') || lowerQuery.includes('recent') ||
            lowerQuery.includes('latest') || lowerQuery.includes('trends')) {
            tools.push('NEWSDATA');
            queries['NEWSDATA'] = query;
        }
        return { tools, queries };
    }
    invoke(state) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check Ollama health first
            const healthStatus = yield this.healthChecker.checkHealth();
            if (!healthStatus.isConnected) {
                logger_1.default.error('Ollama is not connected, using fallback search plan');
                return Object.assign(Object.assign({}, state), { searchPlan: this.generateFallbackPlan(state.researchQuery) });
            }
            if (!healthStatus.requiredModels.thinking.available) {
                logger_1.default.error(`Thinking model ${config_1.config.llm.thinkingModel} not available, using fallback search plan`);
                return Object.assign(Object.assign({}, state), { searchPlan: this.generateFallbackPlan(state.researchQuery) });
            }
            try {
                const formattedPrompt = yield this.prompt.format({
                    input: state.researchQuery
                });
                logger_1.default.debug('Sending prompt to thinking model...');
                const response = yield this.model.invoke(formattedPrompt);
                if (!response || !response.content) {
                    logger_1.default.warn('Empty response from model, using fallback plan');
                    return Object.assign(Object.assign({}, state), { searchPlan: this.generateFallbackPlan(state.researchQuery) });
                }
                const searchPlan = this.parseToolPlan(response.content.toString());
                if (!searchPlan || !searchPlan.tools.length) {
                    logger_1.default.warn('Invalid search plan generated, using fallback');
                    return Object.assign(Object.assign({}, state), { searchPlan: this.generateFallbackPlan(state.researchQuery) });
                }
                logger_1.default.info(`Search plan generated: ${searchPlan.tools.join(', ')}`);
                return Object.assign(Object.assign({}, state), { searchPlan });
            }
            catch (error) {
                logger_1.default.error('Error in search planner:', error);
                logger_1.default.info('Using fallback search plan due to error');
                return Object.assign(Object.assign({}, state), { searchPlan: this.generateFallbackPlan(state.researchQuery) });
            }
        });
    }
}
exports.SearchPlannerBrain = SearchPlannerBrain;
