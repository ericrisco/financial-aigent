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
exports.createResearchGraph = void 0;
const langgraph_1 = require("@langchain/langgraph");
const config_1 = require("../config/config");
const SearchPlannerBrain_1 = require("../brains/SearchPlannerBrain");
const ToolExecutor_1 = require("../tools/ToolExecutor");
const ContentSummarizerBrain_1 = require("../brains/ContentSummarizerBrain");
const GapAnalyzerBrain_1 = require("../brains/GapAnalyzerBrain");
const DocumentStructureBrain_1 = require("../brains/DocumentStructureBrain");
const ContentGeneratorBrain_1 = require("../brains/ContentGeneratorBrain");
const logger_1 = __importDefault(require("../utils/logger"));
const createResearchGraph = (onProgress) => {
    const graph = new langgraph_1.StateGraph({
        channels: {
            researchQuery: { value: null, default: () => "" },
            searchPlan: { value: null },
            searchResults: { value: null },
            gapQuery: { value: null },
            documentStructure: { value: null },
            finalDocument: { value: null },
            findGapLoops: { value: null, default: () => 0 },
            financialData: { value: null },
            newsData: { value: null }
        }
    });
    const searchPlanner = new SearchPlannerBrain_1.SearchPlannerBrain();
    const toolExecutor = new ToolExecutor_1.ToolExecutor();
    const summarizer = new ContentSummarizerBrain_1.ContentSummarizerBrain();
    const gapAnalyzer = new GapAnalyzerBrain_1.GapAnalyzerBrain();
    const structureGenerator = new DocumentStructureBrain_1.DocumentStructureBrain();
    const contentGenerator = new ContentGeneratorBrain_1.ContentGeneratorBrain();
    // Add nodes
    graph.addNode("search_planner", (state) => __awaiter(void 0, void 0, void 0, function* () {
        logger_1.default.info('Creating search plan...');
        onProgress === null || onProgress === void 0 ? void 0 : onProgress("search_planner", 10, "Planning search strategy...");
        return yield searchPlanner.invoke(state);
    }));
    graph.addNode("execute_tools", (state) => __awaiter(void 0, void 0, void 0, function* () {
        logger_1.default.info('Executing research tools...');
        onProgress === null || onProgress === void 0 ? void 0 : onProgress("search", 25, "Gathering information from multiple sources...");
        if (!state.searchPlan) {
            throw new Error('No search plan available for tool execution');
        }
        return yield toolExecutor.executeToolPlan(state.searchPlan, state);
    }));
    graph.addNode("summarize", (state) => __awaiter(void 0, void 0, void 0, function* () {
        logger_1.default.info('Summarizing search results...');
        onProgress === null || onProgress === void 0 ? void 0 : onProgress("summarize", 40, "Summarizing found information...");
        return yield summarizer.invoke(state);
    }));
    graph.addNode("analyze_gaps", (state) => __awaiter(void 0, void 0, void 0, function* () {
        const currentLoop = (state.findGapLoops || 0) + 1;
        logger_1.default.info(`Analyzing knowledge gaps (Loop ${currentLoop})...`);
        onProgress === null || onProgress === void 0 ? void 0 : onProgress("analyze_gaps", 60, `Analyzing knowledge gaps (Loop ${currentLoop})...`);
        // Force NONE if we've reached max loops to prevent infinite recursion
        if (currentLoop > config_1.config.research.maxGapLoops) {
            logger_1.default.warn(`Reached maximum gap loops (${config_1.config.research.maxGapLoops}), forcing completion`);
            return Object.assign(Object.assign({}, state), { gapQuery: 'NONE', findGapLoops: currentLoop });
        }
        const newState = yield gapAnalyzer.invoke(state);
        return Object.assign(Object.assign({}, newState), { findGapLoops: currentLoop });
    }));
    graph.addNode("fill_gaps", (state) => __awaiter(void 0, void 0, void 0, function* () {
        logger_1.default.info('Filling knowledge gaps...');
        onProgress === null || onProgress === void 0 ? void 0 : onProgress("search", 35, "Filling identified knowledge gaps...");
        if (!state.gapQuery || state.gapQuery === 'NONE') {
            logger_1.default.warn('No valid gap query, skipping gap filling');
            return state;
        }
        try {
            return yield toolExecutor.executeToolPlan(state.gapQuery, state);
        }
        catch (error) {
            logger_1.default.error('Error filling gaps:', error);
            // Continue with existing data if gap filling fails
            return state;
        }
    }));
    graph.addNode("generate_structure", (state) => __awaiter(void 0, void 0, void 0, function* () {
        logger_1.default.info('Generating document structure...');
        onProgress === null || onProgress === void 0 ? void 0 : onProgress("generate_structure", 75, "Generating document structure...");
        return yield structureGenerator.invoke(state);
    }));
    graph.addNode("generate_content", (state) => __awaiter(void 0, void 0, void 0, function* () {
        logger_1.default.info('Generating final document...');
        onProgress === null || onProgress === void 0 ? void 0 : onProgress("generate_content", 90, "Generating final document...");
        return yield contentGenerator.invoke(state);
    }));
    // Define conditional edges with improved logic
    const shouldContinueSearching = (state) => {
        const currentLoops = state.findGapLoops || 0;
        logger_1.default.debug(`Gap analysis decision: loops=${currentLoops}, maxLoops=${config_1.config.research.maxGapLoops}, gapQuery=${state.gapQuery}`);
        // Always stop if we've reached max loops
        if (currentLoops >= config_1.config.research.maxGapLoops) {
            logger_1.default.info(`Reached maximum gap search loops (${config_1.config.research.maxGapLoops}), proceeding to document generation...`);
            return "generate_structure";
        }
        // Stop if no gaps found
        if (state.gapQuery === 'NONE' || !state.gapQuery) {
            logger_1.default.info('No knowledge gaps found, proceeding to document generation...');
            return "generate_structure";
        }
        // Stop if gapQuery is invalid
        if (typeof state.gapQuery === 'object' && (!state.gapQuery.tools || state.gapQuery.tools.length === 0)) {
            logger_1.default.info('Invalid gap query, proceeding to document generation...');
            return "generate_structure";
        }
        logger_1.default.info(`Found knowledge gaps, continuing search (loop ${currentLoops + 1})...`);
        return "fill_gaps";
    };
    // Connect nodes
    graph.addEdge("search_planner", "execute_tools");
    graph.addEdge("execute_tools", "summarize");
    graph.addEdge("summarize", "analyze_gaps");
    // Conditional branching after gap analysis
    graph.addConditionalEdges("analyze_gaps", shouldContinueSearching);
    graph.addEdge("fill_gaps", "summarize");
    graph.addEdge("generate_structure", "generate_content");
    graph.addEdge("generate_content", langgraph_1.END);
    // Set entry point
    graph.setEntryPoint("search_planner");
    // Compile the graph
    const compiledGraph = graph.compile();
    return compiledGraph;
};
exports.createResearchGraph = createResearchGraph;
