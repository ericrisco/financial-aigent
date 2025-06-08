import { OllamaHealthChecker } from '../utils/ollama-health';
import { config } from '../config/config';

async function runOllamaDiagnostic() {
  console.log('🔍 Ollama Diagnostic Tool\n');
  console.log('Configuration:');
  console.log(`- Base URL: ${config.llm.ollamaBaseUrl}`);
  console.log(`- Thinking Model: ${config.llm.thinkingModel}`);
  console.log(`- Generating Model: ${config.llm.generatingModel}\n`);

  const healthChecker = new OllamaHealthChecker();

  try {
    console.log('🏥 Running health check...\n');
    const status = await healthChecker.checkHealth();

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
    } else {
      console.log('  No models found');
    }

    console.log('\n🎯 Required Models:');
    console.log(`  - Thinking (${status.requiredModels.thinking.name}): ${status.requiredModels.thinking.available ? '✅' : '❌'}`);
    console.log(`  - Generating (${status.requiredModels.generating.name}): ${status.requiredModels.generating.available ? '✅' : '❌'}`);

    if (!status.isHealthy && status.isConnected) {
      console.log('\n🔧 Attempting to fix issues...');
      const fixedStatus = await healthChecker.diagnoseAndFix();
      
      console.log('\n📊 Status after fix attempt:');
      console.log(`- Healthy: ${fixedStatus.isHealthy ? '✅' : '❌'}`);
      console.log(`- Thinking Model: ${fixedStatus.requiredModels.thinking.available ? '✅' : '❌'}`);
      console.log(`- Generating Model: ${fixedStatus.requiredModels.generating.available ? '✅' : '❌'}`);
    }

    if (status.isHealthy || (status.isConnected && status.requiredModels.thinking.available)) {
      console.log('\n🧪 Testing model generation...');
      const thinkingTest = await healthChecker.testModelGeneration(config.llm.thinkingModel);
      console.log(`Thinking model test: ${thinkingTest ? '✅' : '❌'}`);

      if (status.requiredModels.generating.available) {
        const generatingTest = await healthChecker.testModelGeneration(config.llm.generatingModel);
        console.log(`Generating model test: ${generatingTest ? '✅' : '❌'}`);
      }
    }

    console.log('\n📋 Recommendations:');
    if (!status.isConnected) {
      console.log('❌ Ollama is not running. Please:');
      console.log('   1. Install Ollama from https://ollama.ai');
      console.log('   2. Run "ollama serve" in terminal');
      console.log('   3. Or start the Ollama app');
    } else if (!status.isHealthy) {
      console.log('⚠️  Missing required models. Run:');
      if (!status.requiredModels.thinking.available) {
        console.log(`   ollama pull ${config.llm.thinkingModel}`);
      }
      if (!status.requiredModels.generating.available) {
        console.log(`   ollama pull ${config.llm.generatingModel}`);
      }
    } else {
      console.log('✅ Ollama is healthy and ready to use!');
    }

  } catch (error) {
    console.error('❌ Diagnostic failed:', error);
  }
}

// Run diagnostic
runOllamaDiagnostic(); 