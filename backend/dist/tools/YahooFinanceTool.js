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
exports.YahooFinanceTool = void 0;
const yahoo_finance2_1 = __importDefault(require("yahoo-finance2"));
const config_1 = require("../config/config");
const logger_1 = __importDefault(require("../utils/logger"));
class YahooFinanceTool {
    constructor() {
        this.retryCount = 0;
        // Configure yahoo-finance2 global settings
        try {
            yahoo_finance2_1.default.setGlobalConfig({
                queue: {
                    concurrency: 4,
                    timeout: config_1.config.yahooFinance.requestTimeout
                }
            });
        }
        catch (error) {
            logger_1.default.warn('Failed to set Yahoo Finance global config:', error);
        }
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
                if (this.retryCount >= config_1.config.yahooFinance.maxRetries) {
                    logger_1.default.error(`${context} failed after ${config_1.config.yahooFinance.maxRetries} attempts:`, error);
                    throw new Error(`${context} failed after maximum retries`);
                }
                const delay = config_1.config.yahooFinance.retryDelay * this.retryCount;
                logger_1.default.warn(`${context} failed, retrying in ${delay}ms (attempt ${this.retryCount}/${config_1.config.yahooFinance.maxRetries})`);
                yield this.delay(delay);
                return this.executeWithRetry(operation, context);
            }
        });
    }
    extractSymbolsFromQuery(query) {
        // Extract potential stock symbols from the query
        // Look for patterns like: AAPL, MSFT, $TSLA, etc.
        // Avoid single letters which are often invalid (like "P")
        const symbolPattern = /\b(?:\$)?([A-Z]{2,5})\b/g;
        const matches = query.match(symbolPattern);
        if (!matches)
            return [];
        // Filter out common words that might match the pattern
        const commonWords = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'API', 'CEO', 'CFO', 'IPO', 'ETF', 'NYSE', 'NASDAQ', 'SEC', 'FDA', 'FTC', 'DOJ', 'GDP', 'CPI', 'PPI'];
        return matches
            .map(match => match.replace('$', '').toUpperCase())
            .filter(symbol => !commonWords.includes(symbol))
            .filter((symbol, index, arr) => arr.indexOf(symbol) === index) // Remove duplicates
            .slice(0, config_1.config.yahooFinance.maxSymbolsPerRequest); // Limit symbols
    }
    searchSymbols(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.executeWithRetry(() => __awaiter(this, void 0, void 0, function* () {
                const searchResults = yield yahoo_finance2_1.default.search(query, {
                    quotesCount: 10,
                    newsCount: 0
                });
                const quotes = searchResults.quotes || [];
                return quotes.map((quote) => ({
                    symbol: quote.symbol || '',
                    name: quote.shortname || quote.longname || quote.name || '',
                    exch: quote.exchange || quote.exchDisp || '',
                    type: quote.quoteType || quote.typeDisp || '',
                    exchDisp: quote.exchDisp || quote.exchange || '',
                    typeDisp: quote.typeDisp || quote.quoteType || ''
                })).filter(result => result.symbol); // Filter out empty symbols
            }), 'Symbol search');
        });
    }
    getQuoteData(symbol) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.executeWithRetry(() => __awaiter(this, void 0, void 0, function* () {
                const quote = yield yahoo_finance2_1.default.quote(symbol);
                if (!quote)
                    return null;
                // Safely extract data with fallbacks
                const quoteData = {
                    symbol: quote.symbol || symbol,
                    shortName: quote.shortName,
                    longName: quote.longName,
                    regularMarketPrice: quote.regularMarketPrice,
                    regularMarketChange: quote.regularMarketChange,
                    regularMarketChangePercent: quote.regularMarketChangePercent,
                    regularMarketTime: quote.regularMarketTime ?
                        (quote.regularMarketTime instanceof Date ? quote.regularMarketTime.getTime() : quote.regularMarketTime) :
                        undefined,
                    regularMarketDayHigh: quote.regularMarketDayHigh,
                    regularMarketDayLow: quote.regularMarketDayLow,
                    regularMarketVolume: quote.regularMarketVolume,
                    marketCap: quote.marketCap,
                    currency: quote.currency,
                    exchange: quote.fullExchangeName || quote.exchange,
                    quoteType: quote.quoteType,
                    bid: quote.bid,
                    ask: quote.ask,
                    fiftyTwoWeekLow: quote.fiftyTwoWeekLow,
                    fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
                    dividendYield: quote.dividendYield,
                    trailingPE: quote.trailingPE,
                    forwardPE: quote.forwardPE,
                    bookValue: quote.bookValue,
                    priceToBook: quote.priceToBook,
                    beta: quote.beta,
                    epsTrailingTwelveMonths: quote.epsTrailingTwelveMonths,
                    epsForward: quote.epsForward
                };
                return quoteData;
            }), `Quote data for ${symbol}`);
        });
    }
    getHistoricalData(symbol) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.executeWithRetry(() => __awaiter(this, void 0, void 0, function* () {
                const historical = yield yahoo_finance2_1.default.historical(symbol, {
                    period1: this.getPeriodStartDate(),
                    period2: new Date(),
                    interval: '1d'
                });
                return historical.map((data) => ({
                    date: data.date,
                    open: data.open,
                    high: data.high,
                    low: data.low,
                    close: data.close,
                    adjClose: data.adjClose || data.close, // Fallback to close if adjClose is undefined
                    volume: data.volume
                }));
            }), `Historical data for ${symbol}`);
        });
    }
    getPeriodStartDate() {
        const now = new Date();
        const period = config_1.config.yahooFinance.historicalDataPeriod;
        switch (period) {
            case '1mo':
                return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            case '3mo':
                return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            case '6mo':
                return new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
            case '1y':
            default:
                return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            case '2y':
                return new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000);
        }
    }
    generateFinancialSummary(data) {
        const { symbol, quote, historical } = data;
        if (!quote)
            return `No financial data available for ${symbol}`;
        const price = quote.regularMarketPrice || 0;
        const change = quote.regularMarketChange || 0;
        const changePercent = quote.regularMarketChangePercent || 0;
        const volume = quote.regularMarketVolume || 0;
        const marketCap = quote.marketCap || 0;
        let summary = `${quote.longName || quote.shortName || symbol} (${symbol})\n`;
        summary += `Current Price: ${quote.currency || '$'}${price.toFixed(2)}\n`;
        summary += `Change: ${change >= 0 ? '+' : ''}${change.toFixed(2)} (${changePercent.toFixed(2)}%)\n`;
        summary += `Volume: ${volume.toLocaleString()}\n`;
        if (marketCap > 0) {
            summary += `Market Cap: ${quote.currency || '$'}${(marketCap / 1e9).toFixed(2)}B\n`;
        }
        if (quote.fiftyTwoWeekLow && quote.fiftyTwoWeekHigh) {
            summary += `52-Week Range: ${quote.fiftyTwoWeekLow.toFixed(2)} - ${quote.fiftyTwoWeekHigh.toFixed(2)}\n`;
        }
        if (quote.trailingPE) {
            summary += `P/E Ratio: ${quote.trailingPE.toFixed(2)}\n`;
        }
        if (historical && historical.length > 0) {
            const recentData = historical.slice(-30); // Last 30 days
            const avgVolume = recentData.reduce((sum, day) => sum + day.volume, 0) / recentData.length;
            summary += `30-Day Avg Volume: ${avgVolume.toLocaleString()}\n`;
        }
        return summary;
    }
    invoke(state) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!state.searchPlan) {
                throw new Error('No search plan available for financial data retrieval');
            }
            // Handle both old string format and new ToolPlan format for backward compatibility
            let query;
            if (typeof state.searchPlan === 'string') {
                query = state.searchPlan;
            }
            else {
                query = state.searchPlan.queries['YAHOO_FINANCE'] || Object.values(state.searchPlan.queries)[0] || '';
            }
            if (!query) {
                throw new Error('No query available for Yahoo Finance search');
            }
            this.retryCount = 0;
            const financialDataResults = [];
            try {
                // First, try to extract symbols directly from the query
                const extractedSymbols = this.extractSymbolsFromQuery(query);
                // If no symbols found, search for them
                let symbolsToProcess = extractedSymbols;
                if (symbolsToProcess.length === 0) {
                    logger_1.default.info('No symbols found in query, performing search...');
                    const searchResults = yield this.searchSymbols(query);
                    symbolsToProcess = searchResults.slice(0, 5).map(result => result.symbol);
                }
                // Process each symbol
                for (const symbol of symbolsToProcess) {
                    try {
                        logger_1.default.info(`Processing financial data for symbol: ${symbol}`);
                        const [quote, historical] = yield Promise.all([
                            this.getQuoteData(symbol),
                            this.getHistoricalData(symbol).catch(error => {
                                logger_1.default.warn(`Failed to get historical data for ${symbol}:`, error);
                                return [];
                            })
                        ]);
                        if (quote) {
                            const financialData = {
                                symbol,
                                quote,
                                historical: historical.length > 0 ? historical : undefined
                            };
                            financialData.summary = this.generateFinancialSummary(financialData);
                            financialDataResults.push(financialData);
                        }
                    }
                    catch (error) {
                        logger_1.default.warn(`Error processing symbol ${symbol}:`, error instanceof Error ? error.message : String(error));
                        // Continue with other symbols - don't let one bad symbol break the whole process
                    }
                }
                if (financialDataResults.length === 0) {
                    logger_1.default.warn('No financial data retrieved for the given query');
                }
            }
            catch (error) {
                logger_1.default.warn('Error in Yahoo Finance tool, returning empty results:', error instanceof Error ? error.message : String(error));
                // Return empty results instead of throwing to prevent breaking the entire research process
                return Object.assign(Object.assign({}, state), { financialData: [] });
            }
            return Object.assign(Object.assign({}, state), { financialData: financialDataResults });
        });
    }
}
exports.YahooFinanceTool = YahooFinanceTool;
