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
exports.GapAnalyzerBrain = void 0;
const ollama_1 = require("@langchain/community/chat_models/ollama");
const config_1 = require("../config/config");
const gap_analyzer_prompt_1 = require("./prompts/gap-analyzer.prompt");
const prompts_1 = require("@langchain/core/prompts");
const text_utils_1 = require("../utils/text.utils");
const ollama_health_1 = require("../utils/ollama-health");
const logger_1 = __importDefault(require("../utils/logger"));
class GapAnalyzerBrain {
    constructor() {
        this.model = new ollama_1.ChatOllama({
            baseUrl: config_1.config.llm.ollamaBaseUrl,
            model: config_1.config.llm.thinkingModel,
            temperature: 0
        });
        this.prompt = prompts_1.PromptTemplate.fromTemplate(gap_analyzer_prompt_1.GAP_ANALYZER_PROMPT);
        this.healthChecker = new ollama_health_1.OllamaHealthChecker();
    }
    parseGapAnalysis(response) {
        try {
            let cleanResponse = (0, text_utils_1.removeThinkingTags)(response.trim());
            // Remove markdown code blocks if present
            cleanResponse = cleanResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '');
            // Enhanced NONE detection - check for various ways the model might indicate no gaps
            if (cleanResponse === 'NONE' || cleanResponse === '"NONE"' ||
                cleanResponse.toLowerCase().includes('no significant gaps') ||
                cleanResponse.toLowerCase().includes('no knowledge gaps') ||
                cleanResponse.toLowerCase().includes('complete coverage') ||
                cleanResponse.toLowerCase().includes('sufficient information') ||
                cleanResponse.toLowerCase().includes('comprehensive coverage') ||
                cleanResponse.toLowerCase().includes('no additional') ||
                cleanResponse.toLowerCase().includes('adequate information') ||
                cleanResponse.toLowerCase().includes('meets institutional standards') ||
                cleanResponse.toLowerCase().includes('no gaps') ||
                cleanResponse.toLowerCase().includes('analysis is complete')) {
                return 'NONE';
            }
            // Try to extract JSON from the response if it's mixed with text
            let jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                cleanResponse = jsonMatch[0];
            }
            else {
                // If no JSON found, check if it's a descriptive response indicating no gaps
                if (cleanResponse.toLowerCase().includes('analysis') &&
                    (cleanResponse.toLowerCase().includes('complete') ||
                        cleanResponse.toLowerCase().includes('sufficient') ||
                        cleanResponse.toLowerCase().includes('comprehensive'))) {
                    logger_1.default.info('Model provided descriptive response indicating analysis is complete');
                    return 'NONE';
                }
                // If response doesn't contain JSON and doesn't indicate completion, return NONE
                logger_1.default.warn('No JSON found in response and no completion indicators, returning NONE');
                logger_1.default.info('Response preview:', cleanResponse.substring(0, 100) + '...');
                return 'NONE';
            }
            const parsed = JSON.parse(cleanResponse);
            if (!parsed.tools || !Array.isArray(parsed.tools) || !parsed.queries) {
                logger_1.default.warn('Invalid gap analysis structure, returning NONE');
                return 'NONE';
            }
            // Validate that tools and queries are meaningful
            if (parsed.tools.length === 0 || Object.keys(parsed.queries).length === 0) {
                logger_1.default.warn('Empty tools or queries, returning NONE');
                return 'NONE';
            }
            return {
                tools: parsed.tools,
                queries: parsed.queries
            };
        }
        catch (error) {
            logger_1.default.warn('Failed to parse gap analysis JSON, treating as NONE:', error instanceof Error ? error.message : String(error));
            logger_1.default.info('Raw response preview:', response.substring(0, 200) + '...');
            return 'NONE';
        }
    }
    concatenateSummaries(state) {
        if (!state.searchResults)
            return '';
        return state.searchResults
            .map((result, index) => {
            if (!result.summary)
                return '';
            return `Source ${index + 1}:\n${result.summary}\n`;
        })
            .join('\n');
    }
    assessInformationCompleteness(state) {
        // SUPER PRO analysis requires much higher standards - be more demanding
        const summaries = this.concatenateSummaries(state);
        const currentLoops = state.findGapLoops || 0;
        // Only skip gap analysis if we've already done 2+ loops (instead of 1)
        if (currentLoops >= 2) {
            logger_1.default.info('Completed multiple gap analysis rounds, considering sufficient for SUPER PRO standards');
            return true;
        }
        // Require much more substantial information for SUPER PRO reports
        if (summaries.length < 3000) { // Increased from 1000 to 3000
            logger_1.default.info('Insufficient information depth for SUPER PRO analysis, continuing gap search');
            return false;
        }
        // Require more sources for comprehensive coverage
        if (!state.searchResults || state.searchResults.length < 5) { // Increased from 3 to 5
            logger_1.default.info('Insufficient source diversity for SUPER PRO analysis, continuing gap search');
            return false;
        }
        // Check for financial data presence (critical for SUPER PRO)
        if (!state.financialData || state.financialData.length === 0) {
            logger_1.default.info('Missing financial data for SUPER PRO analysis, continuing gap search');
            return false;
        }
        // Check for news data presence (critical for current market context)
        if (!state.newsData || state.newsData.length === 0) {
            logger_1.default.info('Missing news data for SUPER PRO analysis, continuing gap search');
            return false;
        }
        // For first loop, be more demanding about content quality
        if (currentLoops === 0) {
            // Check if we have diverse content types
            const hasFinancialContent = summaries.toLowerCase().includes('financial') ||
                summaries.toLowerCase().includes('earnings') ||
                summaries.toLowerCase().includes('revenue');
            const hasMarketContent = summaries.toLowerCase().includes('market') ||
                summaries.toLowerCase().includes('competitive') ||
                summaries.toLowerCase().includes('industry');
            const hasRecentContent = summaries.toLowerCase().includes('2024') ||
                summaries.toLowerCase().includes('recent') ||
                summaries.toLowerCase().includes('latest');
            if (!hasFinancialContent || !hasMarketContent || !hasRecentContent) {
                logger_1.default.info('Missing critical content dimensions for SUPER PRO analysis, continuing gap search');
                return false;
            }
        }
        logger_1.default.info('Information meets SUPER PRO standards, proceeding to document generation');
        return true;
    }
    invoke(state) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!state.searchResults || state.searchResults.length === 0) {
                logger_1.default.warn('No search results available, returning NONE for gap analysis');
                return Object.assign(Object.assign({}, state), { gapQuery: 'NONE' });
            }
            const summaries = this.concatenateSummaries(state);
            if (!summaries) {
                logger_1.default.warn('No summaries available, returning NONE for gap analysis');
                return Object.assign(Object.assign({}, state), { gapQuery: 'NONE' });
            }
            // Conservative assessment first
            if (this.assessInformationCompleteness(state)) {
                logger_1.default.info('Information appears complete, skipping gap analysis');
                return Object.assign(Object.assign({}, state), { gapQuery: 'NONE' });
            }
            // Check Ollama health
            const healthStatus = yield this.healthChecker.checkHealth();
            if (!healthStatus.isConnected || !healthStatus.requiredModels.thinking.available) {
                logger_1.default.warn('Ollama not available for gap analysis, returning NONE');
                return Object.assign(Object.assign({}, state), { gapQuery: 'NONE' });
            }
            try {
                logger_1.default.info('Analyzing knowledge gaps...');
                const formattedPrompt = yield this.prompt.format({
                    topic: state.researchQuery,
                    summaries
                });
                const response = yield this.model.invoke(formattedPrompt);
                if (!response || !response.content) {
                    logger_1.default.warn('Empty response from model, returning NONE');
                    return Object.assign(Object.assign({}, state), { gapQuery: 'NONE' });
                }
                const gapQuery = this.parseGapAnalysis(response.content.toString());
                if (gapQuery === 'NONE') {
                    logger_1.default.info('No knowledge gaps found');
                }
                else {
                    logger_1.default.info(`Found knowledge gaps, tools needed: ${gapQuery.tools.join(', ')}`);
                }
                return Object.assign(Object.assign({}, state), { gapQuery });
            }
            catch (error) {
                logger_1.default.error('Error in gap analysis:', error);
                logger_1.default.info('Returning NONE due to error');
                return Object.assign(Object.assign({}, state), { gapQuery: 'NONE' });
            }
        });
    }
}
exports.GapAnalyzerBrain = GapAnalyzerBrain;
