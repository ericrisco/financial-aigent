import { FinancialData } from './yahoo-finance.interface';
import { NewsData } from './newsdata.interface';

export interface SearchResult {
  title: string;
  url: string;
  content: string;
  rawContent: string;
  score: number;
  summary?: string;
}

export interface ResearchState {
  researchQuery: string;
  searchPlan?: ToolPlan;
  searchResults?: SearchResult[];
  gapQuery?: ToolPlan | 'NONE';
  documentStructure?: string;
  finalDocument?: string;
  findGapLoops?: number;
  financialData?: FinancialData[];
  newsData?: NewsData[];
}

export interface ToolPlan {
  tools: string[];
  queries: { [toolName: string]: string };
}

// We'll add more state properties as we develop more nodes

// ... existing code ... 