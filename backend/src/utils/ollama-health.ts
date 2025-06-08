import axios from 'axios';
import { config } from '../config/config';
import logger from './logger';

export interface OllamaModel {
  name: string;
  size: number;
  digest: string;
  modified_at: string;
}

export interface OllamaHealthStatus {
  isHealthy: boolean;
  isConnected: boolean;
  availableModels: string[];
  requiredModels: {
    thinking: { name: string; available: boolean };
    generating: { name: string; available: boolean };
  };
  error?: string;
}

export class OllamaHealthChecker {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.llm.ollamaBaseUrl;
  }

  async checkHealth(): Promise<OllamaHealthStatus> {
    const status: OllamaHealthStatus = {
      isHealthy: false,
      isConnected: false,
      availableModels: [],
      requiredModels: {
        thinking: { name: config.llm.thinkingModel, available: false },
        generating: { name: config.llm.generatingModel, available: false }
      }
    };

    try {
      // Check if Ollama is running
      logger.info('Checking Ollama connection...');
      const healthResponse = await axios.get(`${this.baseUrl}/api/tags`, {
        timeout: 5000
      });

      if (healthResponse.status === 200) {
        status.isConnected = true;
        logger.info('✅ Ollama is connected');

        // Get available models
        const models: OllamaModel[] = healthResponse.data.models || [];
        status.availableModels = models.map(model => model.name);

        // Check required models
        status.requiredModels.thinking.available = status.availableModels.includes(config.llm.thinkingModel);
        status.requiredModels.generating.available = status.availableModels.includes(config.llm.generatingModel);

        logger.info(`Available models: ${status.availableModels.join(', ')}`);
        logger.info(`Thinking model (${config.llm.thinkingModel}): ${status.requiredModels.thinking.available ? '✅' : '❌'}`);
        logger.info(`Generating model (${config.llm.generatingModel}): ${status.requiredModels.generating.available ? '✅' : '❌'}`);

        status.isHealthy = status.requiredModels.thinking.available && status.requiredModels.generating.available;

        if (!status.isHealthy) {
          const missingModels = [];
          if (!status.requiredModels.thinking.available) missingModels.push(config.llm.thinkingModel);
          if (!status.requiredModels.generating.available) missingModels.push(config.llm.generatingModel);
          status.error = `Missing required models: ${missingModels.join(', ')}`;
        }

      } else {
        status.error = `Ollama responded with status ${healthResponse.status}`;
      }

    } catch (error) {
      status.isConnected = false;
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          status.error = 'Ollama is not running or not accessible';
          logger.error('❌ Ollama connection refused - is Ollama running?');
        } else if (error.code === 'ETIMEDOUT') {
          status.error = 'Ollama connection timeout';
          logger.error('❌ Ollama connection timeout');
        } else {
          status.error = `Ollama connection error: ${error.message}`;
          logger.error('❌ Ollama connection error:', error.message);
        }
      } else {
        status.error = `Unknown error: ${error}`;
        logger.error('❌ Unknown Ollama error:', error);
      }
    }

    return status;
  }

  async testModelGeneration(modelName: string): Promise<boolean> {
    try {
      logger.info(`Testing model generation for: ${modelName}`);
      
      const response = await axios.post(`${this.baseUrl}/api/generate`, {
        model: modelName,
        prompt: 'Test prompt: Say "Hello"',
        stream: false
      }, {
        timeout: 30000
      });

      if (response.data && response.data.response) {
        logger.info(`✅ Model ${modelName} generation test successful`);
        return true;
      } else {
        logger.warn(`❌ Model ${modelName} returned empty response`);
        return false;
      }

    } catch (error) {
      logger.error(`❌ Model ${modelName} generation test failed:`, error);
      return false;
    }
  }

  async pullModel(modelName: string): Promise<boolean> {
    try {
      logger.info(`Attempting to pull model: ${modelName}`);
      
      const response = await axios.post(`${this.baseUrl}/api/pull`, {
        name: modelName
      }, {
        timeout: 300000 // 5 minutes for model download
      });

      if (response.status === 200) {
        logger.info(`✅ Model ${modelName} pulled successfully`);
        return true;
      } else {
        logger.error(`❌ Failed to pull model ${modelName}`);
        return false;
      }

    } catch (error) {
      logger.error(`❌ Error pulling model ${modelName}:`, error);
      return false;
    }
  }

  async diagnoseAndFix(): Promise<OllamaHealthStatus> {
    const status = await this.checkHealth();

    if (!status.isConnected) {
      logger.error('🔧 Ollama is not running. Please start Ollama:');
      logger.error('   - macOS: Run "ollama serve" in terminal');
      logger.error('   - Or start Ollama app from Applications');
      return status;
    }

    if (!status.isHealthy) {
      logger.warn('🔧 Attempting to fix missing models...');
      
      if (!status.requiredModels.thinking.available) {
        logger.info(`Pulling thinking model: ${config.llm.thinkingModel}`);
        await this.pullModel(config.llm.thinkingModel);
      }

      if (!status.requiredModels.generating.available) {
        logger.info(`Pulling generating model: ${config.llm.generatingModel}`);
        await this.pullModel(config.llm.generatingModel);
      }

      // Re-check after pulling models
      return await this.checkHealth();
    }

    return status;
  }
} 