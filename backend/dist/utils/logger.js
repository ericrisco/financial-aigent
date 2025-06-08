"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const config_1 = require("../config/config");
const logger = winston_1.default.createLogger({
    level: config_1.config.logs.level,
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
    transports: [
        new winston_1.default.transports.Console({
            format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple()),
        }),
    ],
});
if (config_1.config.env === 'production') {
    logger.add(new winston_1.default.transports.File({ filename: 'logs/error.log', level: 'error' }));
    logger.add(new winston_1.default.transports.File({ filename: 'logs/combined.log' }));
}
exports.default = logger;
