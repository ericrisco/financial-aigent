"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupWebSocket = void 0;
const ws_1 = require("ws");
const deepresearch_controller_1 = require("../controllers/deepresearch.controller");
const config_1 = require("../config/config");
const logger_1 = __importDefault(require("../utils/logger"));
const setupWebSocket = (server) => {
    const wss = new ws_1.WebSocketServer({
        server,
        path: config_1.config.ws.path
    });
    const deepResearchController = new deepresearch_controller_1.DeepResearchController();
    wss.on('connection', (ws, request) => {
        const clientIp = request.socket.remoteAddress;
        logger_1.default.info(`New WebSocket connection from ${clientIp} on path ${request.url}`);
        deepResearchController.handleConnection(ws);
    });
    wss.on('error', (error) => {
        logger_1.default.error('WebSocket server error:', error);
    });
    logger_1.default.info(`WebSocket server initialized on path: ${config_1.config.ws.path}`);
};
exports.setupWebSocket = setupWebSocket;
