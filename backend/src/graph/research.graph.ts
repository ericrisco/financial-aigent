import { StateGraph, END } from '@langchain/langgraph';
import { config } from '../config/config';
import { ResearchState } from '../interfaces/state.interface';
import { SearchPlannerBrain } from '../brains/SearchPlannerBrain';
import { ToolExecutor } from '../tools/ToolExecutor';
import { ContentSummarizerBrain } from '../brains/ContentSummarizerBrain';
import { GapAnalyzerBrain } from '../brains/GapAnalyzerBrain';
import { DocumentStructureBrain } from '../brains/DocumentStructureBrain';
import { ContentGeneratorBrain } from '../brains/ContentGeneratorBrain';
import logger from '../utils/logger';
import { ResearchStep } from '../interfaces/deepresearch.interface';

export type ProgressCallback = (step: ResearchStep, progress: number, details: string) => void;

export const createResearchGraph = (onProgress?: ProgressCallback) => {
  const graph = new StateGraph<ResearchState>({
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

  const searchPlanner = new SearchPlannerBrain();
  const toolExecutor = new ToolExecutor();
  const summarizer = new ContentSummarizerBrain();
  const gapAnalyzer = new GapAnalyzerBrain();
  const structureGenerator = new DocumentStructureBrain();
  const contentGenerator = new ContentGeneratorBrain();

  // Add nodes
  graph.addNode("search_planner", async (state) => {
    logger.info('Creating search plan...');
    onProgress?.("search_planner", 10, "Planning search strategy...");
    return await searchPlanner.invoke(state);
  });

  graph.addNode("execute_tools", async (state) => {
    logger.info('Executing research tools...');
    onProgress?.("search", 25, "Gathering information from multiple sources...");
    
    if (!state.searchPlan) {
      throw new Error('No search plan available for tool execution');
    }

    return await toolExecutor.executeToolPlan(state.searchPlan, state);
  });

  graph.addNode("summarize", async (state) => {
    logger.info('Summarizing search results...');
    onProgress?.("summarize", 40, "Summarizing found information...");
    return await summarizer.invoke(state);
  });

  graph.addNode("analyze_gaps", async (state) => {
    const currentLoop = (state.findGapLoops || 0) + 1;
    logger.info(`Analyzing knowledge gaps (Loop ${currentLoop})...`);
    onProgress?.("analyze_gaps", 60, `Analyzing knowledge gaps (Loop ${currentLoop})...`);
    
    // Force NONE if we've reached max loops to prevent infinite recursion
    if (currentLoop > config.research.maxGapLoops) {
      logger.warn(`Reached maximum gap loops (${config.research.maxGapLoops}), forcing completion`);
      return {
        ...state,
        gapQuery: 'NONE',
        findGapLoops: currentLoop
      };
    }

    const newState = await gapAnalyzer.invoke(state);
    return {
      ...newState,
      findGapLoops: currentLoop
    };
  });

  graph.addNode("fill_gaps", async (state) => {
    logger.info('Filling knowledge gaps...');
    onProgress?.("search", 35, "Filling identified knowledge gaps...");
    
    if (!state.gapQuery || state.gapQuery === 'NONE') {
      logger.warn('No valid gap query, skipping gap filling');
      return state;
    }

    try {
      return await toolExecutor.executeToolPlan(state.gapQuery, state);
    } catch (error) {
      logger.error('Error filling gaps:', error);
      // Continue with existing data if gap filling fails
      return state;
    }
  });

  graph.addNode("generate_structure", async (state) => {
    logger.info('Generating document structure...');
    onProgress?.("generate_structure", 75, "Generating document structure...");
    return await structureGenerator.invoke(state);
  });

  graph.addNode("generate_content", async (state) => {
    logger.info('Generating final document...');
    onProgress?.("generate_content", 90, "Generating final document...");
    return await contentGenerator.invoke(state);
  });

  // Define conditional edges with improved logic
  const shouldContinueSearching = (state: ResearchState): string => {
    const currentLoops = state.findGapLoops || 0;
    
    logger.debug(`Gap analysis decision: loops=${currentLoops}, maxLoops=${config.research.maxGapLoops}, gapQuery=${state.gapQuery}`);
    
    // Always stop if we've reached max loops
    if (currentLoops >= config.research.maxGapLoops) {
      logger.info(`Reached maximum gap search loops (${config.research.maxGapLoops}), proceeding to document generation...`);
      return "generate_structure";
    }

    // Stop if no gaps found
    if (state.gapQuery === 'NONE' || !state.gapQuery) {
      logger.info('No knowledge gaps found, proceeding to document generation...');
      return "generate_structure";
    }

    // Stop if gapQuery is invalid
    if (typeof state.gapQuery === 'object' && (!state.gapQuery.tools || state.gapQuery.tools.length === 0)) {
      logger.info('Invalid gap query, proceeding to document generation...');
      return "generate_structure";
    }

    logger.info(`Found knowledge gaps, continuing search (loop ${currentLoops + 1})...`);
    return "fill_gaps";
  };

  // Connect nodes
  graph.addEdge("search_planner", "execute_tools");
  graph.addEdge("execute_tools", "summarize");
  graph.addEdge("summarize", "analyze_gaps");

  // Conditional branching after gap analysis
  graph.addConditionalEdges(
    "analyze_gaps",
    shouldContinueSearching
  );

  graph.addEdge("fill_gaps", "summarize");
  graph.addEdge("generate_structure", "generate_content");
  graph.addEdge("generate_content", END);

  // Set entry point
  graph.setEntryPoint("search_planner");

  // Compile the graph
  const compiledGraph = graph.compile();
  
  return compiledGraph;
};

export type ResearchGraph = ReturnType<typeof createResearchGraph>; 