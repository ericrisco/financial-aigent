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
exports.HealthController = void 0;
const health_service_1 = require("../services/health.service");
const logger_1 = __importDefault(require("../utils/logger"));
class HealthController {
    constructor() {
        this.getHealth = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const health = yield this.healthService.getHealth();
                if (health.status !== 'UP') {
                    logger_1.default.warn('System health check indicates degraded performance', health);
                }
                res.status(health.status === 'UP' ? 200 : 503).json({
                    success: true,
                    data: health,
                    timestamp: new Date().toISOString()
                });
            }
            catch (error) {
                next(error);
            }
        });
        this.healthService = new health_service_1.HealthService();
    }
}
exports.HealthController = HealthController;
