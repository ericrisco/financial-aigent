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
exports.OllamaHealthChecker = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config/config");
const logger_1 = __importDefault(require("./logger"));
class OllamaHealthChecker {
    constructor() {
        this.baseUrl = config_1.config.llm.ollamaBaseUrl;
    }
    checkHealth() {
        return __awaiter(this, void 0, void 0, function* () {
            const status = {
                isHealthy: false,
                isConnected: false,
                availableModels: [],
                requiredModels: {
                    thinking: { name: config_1.config.llm.thinkingModel, available: false },
                    generating: { name: config_1.config.llm.generatingModel, available: false }
                }
            };
            try {
                // Check if Ollama is running
                logger_1.default.info('Checking Ollama connection...');
                const healthResponse = yield axios_1.default.get(`${this.baseUrl}/api/tags`, {
                    timeout: 5000
                });
                if (healthResponse.status === 200) {
                    status.isConnected = true;
                    logger_1.default.info('✅ Ollama is connected');
                    // Get available models
                    const models = healthResponse.data.models || [];
                    status.availableModels = models.map(model => model.name);
                    // Check required models
                    status.requiredModels.thinking.available = status.availableModels.includes(config_1.config.llm.thinkingModel);
                    status.requiredModels.generating.available = status.availableModels.includes(config_1.config.llm.generatingModel);
                    logger_1.default.info(`Available models: ${status.availableModels.join(', ')}`);
                    logger_1.default.info(`Thinking model (${config_1.config.llm.thinkingModel}): ${status.requiredModels.thinking.available ? '✅' : '❌'}`);
                    logger_1.default.info(`Generating model (${config_1.config.llm.generatingModel}): ${status.requiredModels.generating.available ? '✅' : '❌'}`);
                    status.isHealthy = status.requiredModels.thinking.available && status.requiredModels.generating.available;
                    if (!status.isHealthy) {
                        const missingModels = [];
                        if (!status.requiredModels.thinking.available)
                            missingModels.push(config_1.config.llm.thinkingModel);
                        if (!status.requiredModels.generating.available)
                            missingModels.push(config_1.config.llm.generatingModel);
                        status.error = `Missing required models: ${missingModels.join(', ')}`;
                    }
                }
                else {
                    status.error = `Ollama responded with status ${healthResponse.status}`;
                }
            }
            catch (error) {
                status.isConnected = false;
                if (axios_1.default.isAxiosError(error)) {
                    if (error.code === 'ECONNREFUSED') {
                        status.error = 'Ollama is not running or not accessible';
                        logger_1.default.error('❌ Ollama connection refused - is Ollama running?');
                    }
                    else if (error.code === 'ETIMEDOUT') {
                        status.error = 'Ollama connection timeout';
                        logger_1.default.error('❌ Ollama connection timeout');
                    }
                    else {
                        status.error = `Ollama connection error: ${error.message}`;
                        logger_1.default.error('❌ Ollama connection error:', error.message);
                    }
                }
                else {
                    status.error = `Unknown error: ${error}`;
                    logger_1.default.error('❌ Unknown Ollama error:', error);
                }
            }
            return status;
        });
    }
    testModelGeneration(modelName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger_1.default.info(`Testing model generation for: ${modelName}`);
                const response = yield axios_1.default.post(`${this.baseUrl}/api/generate`, {
                    model: modelName,
                    prompt: 'Test prompt: Say "Hello"',
                    stream: false
                }, {
                    timeout: 30000
                });
                if (response.data && response.data.response) {
                    logger_1.default.info(`✅ Model ${modelName} generation test successful`);
                    return true;
                }
                else {
                    logger_1.default.warn(`❌ Model ${modelName} returned empty response`);
                    return false;
                }
            }
            catch (error) {
                logger_1.default.error(`❌ Model ${modelName} generation test failed:`, error);
                return false;
            }
        });
    }
    pullModel(modelName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger_1.default.info(`Attempting to pull model: ${modelName}`);
                const response = yield axios_1.default.post(`${this.baseUrl}/api/pull`, {
                    name: modelName
                }, {
                    timeout: 300000 // 5 minutes for model download
                });
                if (response.status === 200) {
                    logger_1.default.info(`✅ Model ${modelName} pulled successfully`);
                    return true;
                }
                else {
                    logger_1.default.error(`❌ Failed to pull model ${modelName}`);
                    return false;
                }
            }
            catch (error) {
                logger_1.default.error(`❌ Error pulling model ${modelName}:`, error);
                return false;
            }
        });
    }
    diagnoseAndFix() {
        return __awaiter(this, void 0, void 0, function* () {
            const status = yield this.checkHealth();
            if (!status.isConnected) {
                logger_1.default.error('🔧 Ollama is not running. Please start Ollama:');
                logger_1.default.error('   - macOS: Run "ollama serve" in terminal');
                logger_1.default.error('   - Or start Ollama app from Applications');
                return status;
            }
            if (!status.isHealthy) {
                logger_1.default.warn('🔧 Attempting to fix missing models...');
                if (!status.requiredModels.thinking.available) {
                    logger_1.default.info(`Pulling thinking model: ${config_1.config.llm.thinkingModel}`);
                    yield this.pullModel(config_1.config.llm.thinkingModel);
                }
                if (!status.requiredModels.generating.available) {
                    logger_1.default.info(`Pulling generating model: ${config_1.config.llm.generatingModel}`);
                    yield this.pullModel(config_1.config.llm.generatingModel);
                }
                // Re-check after pulling models
                return yield this.checkHealth();
            }
            return status;
        });
    }
}
exports.OllamaHealthChecker = OllamaHealthChecker;
