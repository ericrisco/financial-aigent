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
Object.defineProperty(exports, "__esModule", { value: true });
const ollama_health_1 = require("../utils/ollama-health");
const config_1 = require("../config/config");
function runOllamaDiagnostic() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('🔍 Ollama Diagnostic Tool\n');
        console.log('Configuration:');
        console.log(`- Base URL: ${config_1.config.llm.ollamaBaseUrl}`);
        console.log(`- Thinking Model: ${config_1.config.llm.thinkingModel}`);
        console.log(`- Generating Model: ${config_1.config.llm.generatingModel}\n`);
        const healthChecker = new ollama_health_1.OllamaHealthChecker();
        try {
            console.log('🏥 Running health check...\n');
            const status = yield healthChecker.checkHealth();
            console.log('📊 Health Status:');
            console.log(`- Connected: ${status.isConnected ? '✅' : '❌'}`);
            console.log(`- Healthy: ${status.isHealthy ? '✅' : '❌'}`);
            if (status.error) {
                console.log(`- Error: ${status.error}`);
            }
            console.log('\n📦 Available Models:');
            if (status.availableModels.length > 0) {
                status.availableModels.forEach(model => {
                    console.log(`  - ${model}`);
                });
            }
            else {
                console.log('  No models found');
            }
            console.log('\n🎯 Required Models:');
            console.log(`  - Thinking (${status.requiredModels.thinking.name}): ${status.requiredModels.thinking.available ? '✅' : '❌'}`);
            console.log(`  - Generating (${status.requiredModels.generating.name}): ${status.requiredModels.generating.available ? '✅' : '❌'}`);
            if (!status.isHealthy && status.isConnected) {
                console.log('\n🔧 Attempting to fix issues...');
                const fixedStatus = yield healthChecker.diagnoseAndFix();
                console.log('\n📊 Status after fix attempt:');
                console.log(`- Healthy: ${fixedStatus.isHealthy ? '✅' : '❌'}`);
                console.log(`- Thinking Model: ${fixedStatus.requiredModels.thinking.available ? '✅' : '❌'}`);
                console.log(`- Generating Model: ${fixedStatus.requiredModels.generating.available ? '✅' : '❌'}`);
            }
            if (status.isHealthy || (status.isConnected && status.requiredModels.thinking.available)) {
                console.log('\n🧪 Testing model generation...');
                const thinkingTest = yield healthChecker.testModelGeneration(config_1.config.llm.thinkingModel);
                console.log(`Thinking model test: ${thinkingTest ? '✅' : '❌'}`);
                if (status.requiredModels.generating.available) {
                    const generatingTest = yield healthChecker.testModelGeneration(config_1.config.llm.generatingModel);
                    console.log(`Generating model test: ${generatingTest ? '✅' : '❌'}`);
                }
            }
            console.log('\n📋 Recommendations:');
            if (!status.isConnected) {
                console.log('❌ Ollama is not running. Please:');
                console.log('   1. Install Ollama from https://ollama.ai');
                console.log('   2. Run "ollama serve" in terminal');
                console.log('   3. Or start the Ollama app');
            }
            else if (!status.isHealthy) {
                console.log('⚠️  Missing required models. Run:');
                if (!status.requiredModels.thinking.available) {
                    console.log(`   ollama pull ${config_1.config.llm.thinkingModel}`);
                }
                if (!status.requiredModels.generating.available) {
                    console.log(`   ollama pull ${config_1.config.llm.generatingModel}`);
                }
            }
            else {
                console.log('✅ Ollama is healthy and ready to use!');
            }
        }
        catch (error) {
            console.error('❌ Diagnostic failed:', error);
        }
    });
}
// Run diagnostic
runOllamaDiagnostic();
