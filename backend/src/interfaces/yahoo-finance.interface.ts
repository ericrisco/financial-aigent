export interface YahooFinanceQuote {
  symbol: string;
  shortName?: string;
  longName?: string;
  regularMarketPrice?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
  regularMarketTime?: number;
  regularMarketDayHigh?: number;
  regularMarketDayLow?: number;
  regularMarketVolume?: number;
  marketCap?: number;
  currency?: string;
  exchange?: string;
  quoteType?: string;
  bid?: number;
  ask?: number;
  fiftyTwoWeekLow?: number;
  fiftyTwoWeekHigh?: number;
  dividendYield?: number;
  trailingPE?: number;
  forwardPE?: number;
  bookValue?: number;
  priceToBook?: number;
  beta?: number;
  epsTrailingTwelveMonths?: number;
  epsForward?: number;
}

export interface YahooFinanceHistoricalData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  adjClose: number;
  volume: number;
}

export interface YahooFinanceSearchResult {
  symbol: string;
  name: string;
  exch: string;
  type: string;
  exchDisp: string;
  typeDisp: string;
}

export interface FinancialData {
  symbol: string;
  quote?: YahooFinanceQuote;
  historical?: YahooFinanceHistoricalData[];
  searchResults?: YahooFinanceSearchResult[];
  summary?: string;
  analysis?: string;
} 