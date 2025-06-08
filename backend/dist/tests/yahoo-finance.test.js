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
exports.testYahooFinanceTool = testYahooFinanceTool;
const YahooFinanceTool_1 = require("../tools/YahooFinanceTool");
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Test script for Yahoo Finance Tool
 *
 * This script tests the functionality of the YahooFinanceTool
 * to ensure it can retrieve financial data correctly.
 */
function testYahooFinanceTool() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f;
        console.log('🧪 Testing Yahoo Finance Tool...\n');
        const yahooFinanceTool = new YahooFinanceTool_1.YahooFinanceTool();
        // Test 1: Basic symbol extraction and data retrieval
        console.log('📊 Test 1: Basic symbol extraction (AAPL)');
        const testState1 = {
            researchQuery: 'Apple stock analysis',
            searchPlan: 'AAPL stock price and performance metrics',
            findGapLoops: 0
        };
        try {
            const result1 = yield yahooFinanceTool.invoke(testState1);
            if (result1.financialData && result1.financialData.length > 0) {
                const appleData = result1.financialData[0];
                console.log('✅ Successfully retrieved Apple data');
                console.log(`   Symbol: ${appleData.symbol}`);
                console.log(`   Has quote data: ${!!appleData.quote}`);
                console.log(`   Has historical data: ${!!appleData.historical}`);
                console.log(`   Summary length: ${((_a = appleData.summary) === null || _a === void 0 ? void 0 : _a.length) || 0} characters`);
                if (appleData.quote) {
                    console.log(`   Current price: $${((_b = appleData.quote.regularMarketPrice) === null || _b === void 0 ? void 0 : _b.toFixed(2)) || 'N/A'}`);
                    console.log(`   Market cap: $${((appleData.quote.marketCap || 0) / 1e9).toFixed(2)}B`);
                }
            }
            else {
                console.log('❌ No financial data retrieved for Apple');
            }
        }
        catch (error) {
            console.log('❌ Test 1 failed:', error);
        }
        console.log('\n' + '='.repeat(50) + '\n');
        // Test 2: Multiple symbols
        console.log('📊 Test 2: Multiple symbols (AAPL, MSFT)');
        const testState2 = {
            researchQuery: 'Tech stocks comparison',
            searchPlan: 'AAPL MSFT technology stocks comparison',
            findGapLoops: 0
        };
        try {
            const result2 = yield yahooFinanceTool.invoke(testState2);
            if (result2.financialData) {
                console.log(`✅ Retrieved data for ${result2.financialData.length} symbols`);
                result2.financialData.forEach((data, index) => {
                    var _a, _b, _c;
                    console.log(`   ${index + 1}. ${data.symbol} - ${((_a = data.quote) === null || _a === void 0 ? void 0 : _a.shortName) || ((_b = data.quote) === null || _b === void 0 ? void 0 : _b.longName) || 'Unknown'}`);
                    if ((_c = data.quote) === null || _c === void 0 ? void 0 : _c.regularMarketPrice) {
                        console.log(`      Price: $${data.quote.regularMarketPrice.toFixed(2)}`);
                    }
                });
            }
            else {
                console.log('❌ No financial data retrieved for multiple symbols');
            }
        }
        catch (error) {
            console.log('❌ Test 2 failed:', error);
        }
        console.log('\n' + '='.repeat(50) + '\n');
        // Test 3: Company name search
        console.log('📊 Test 3: Company name search (Tesla)');
        const testState3 = {
            researchQuery: 'Tesla financial analysis',
            searchPlan: 'Tesla electric vehicle company financial performance',
            findGapLoops: 0
        };
        try {
            const result3 = yield yahooFinanceTool.invoke(testState3);
            if (result3.financialData && result3.financialData.length > 0) {
                console.log('✅ Successfully found Tesla data via company name search');
                const teslaData = result3.financialData[0];
                console.log(`   Found symbol: ${teslaData.symbol}`);
                console.log(`   Company name: ${((_c = teslaData.quote) === null || _c === void 0 ? void 0 : _c.longName) || ((_d = teslaData.quote) === null || _d === void 0 ? void 0 : _d.shortName) || 'Unknown'}`);
                if (teslaData.historical && teslaData.historical.length > 0) {
                    console.log(`   Historical data points: ${teslaData.historical.length}`);
                    const latest = teslaData.historical[teslaData.historical.length - 1];
                    console.log(`   Latest close: $${latest.close.toFixed(2)}`);
                }
            }
            else {
                console.log('❌ No data found for Tesla via company name search');
            }
        }
        catch (error) {
            console.log('❌ Test 3 failed:', error);
        }
        console.log('\n' + '='.repeat(50) + '\n');
        // Test 4: Error handling - invalid symbol
        console.log('📊 Test 4: Error handling (invalid symbol)');
        const testState4 = {
            researchQuery: 'Invalid stock analysis',
            searchPlan: 'INVALIDXYZ stock analysis',
            findGapLoops: 0
        };
        try {
            const result4 = yield yahooFinanceTool.invoke(testState4);
            if (!result4.financialData || result4.financialData.length === 0) {
                console.log('✅ Correctly handled invalid symbol (no data returned)');
            }
            else {
                console.log('⚠️  Unexpected: Got data for invalid symbol');
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.log('✅ Correctly handled invalid symbol with error:', errorMessage);
        }
        console.log('\n' + '='.repeat(50) + '\n');
        // Test 5: Performance test
        console.log('📊 Test 5: Performance test (multiple symbols)');
        const testState5 = {
            researchQuery: 'Major tech stocks',
            searchPlan: 'AAPL GOOGL MSFT AMZN TSLA performance analysis',
            findGapLoops: 0
        };
        try {
            const startTime = Date.now();
            const result5 = yield yahooFinanceTool.invoke(testState5);
            const endTime = Date.now();
            const duration = endTime - startTime;
            console.log(`✅ Performance test completed in ${duration}ms`);
            console.log(`   Retrieved data for ${((_e = result5.financialData) === null || _e === void 0 ? void 0 : _e.length) || 0} symbols`);
            console.log(`   Average time per symbol: ${duration / (((_f = result5.financialData) === null || _f === void 0 ? void 0 : _f.length) || 1)}ms`);
        }
        catch (error) {
            console.log('❌ Performance test failed:', error);
        }
        console.log('\n🎉 Yahoo Finance Tool testing completed!');
    });
}
// Run the test if this file is executed directly
if (require.main === module) {
    testYahooFinanceTool().catch(error => {
        logger_1.default.error('Test execution failed:', error);
        process.exit(1);
    });
}
