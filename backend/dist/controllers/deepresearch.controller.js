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
exports.DeepResearchController = void 0;
const deepresearch_service_1 = require("../services/deepresearch.service");
const logger_1 = __importDefault(require("../utils/logger"));
class DeepResearchController {
    constructor() {
        this.handleConnection = (ws) => {
            logger_1.default.info('New WebSocket connection established');
            ws.on('message', (message) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                try {
                    const data = JSON.parse(message);
                    if (data.action === 'start') {
                        if (!((_a = data.query) === null || _a === void 0 ? void 0 : _a.trim())) {
                            throw new Error('Query is required');
                        }
                        logger_1.default.info(`Starting research for query: ${data.query}`);
                        yield this.deepResearchService.startResearch(ws, data.query.trim());
                    }
                }
                catch (error) {
                    logger_1.default.error('Error processing WebSocket message:', error);
                    ws.send(JSON.stringify({
                        error: error instanceof Error ? error.message : 'Invalid message format',
                        timestamp: new Date().toISOString()
                    }));
                }
            }));
            ws.on('close', () => {
                logger_1.default.info('WebSocket connection closed');
            });
            ws.on('error', (error) => {
                logger_1.default.error('WebSocket error:', error);
            });
        };
        this.deepResearchService = new deepresearch_service_1.DeepResearchService();
    }
}
exports.DeepResearchController = DeepResearchController;
