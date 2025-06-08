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
exports.ContentGeneratorBrain = void 0;
const ollama_1 = require("@langchain/community/chat_models/ollama");
const config_1 = require("../config/config");
const content_generator_prompt_1 = require("./prompts/content-generator.prompt");
const prompts_1 = require("@langchain/core/prompts");
const logger_1 = __importDefault(require("../utils/logger"));
class ContentGeneratorBrain {
    constructor() {
        this.model = new ollama_1.ChatOllama({
            baseUrl: config_1.config.llm.ollamaBaseUrl,
            model: config_1.config.llm.generatingModel,
            temperature: 0.3,
            numPredict: config_1.config.llm.contentGeneratorMaxTokens
        });
        this.prompt = prompts_1.PromptTemplate.fromTemplate(content_generator_prompt_1.CONTENT_GENERATOR_PROMPT);
    }
    concatenateSummaries(state) {
        if (!state.searchResults)
            return '';
        return state.searchResults
            .map((result, index) => {
            if (!result.summary)
                return '';
            return `Source ${index + 1}:\n${result.summary}\n`;
        })
            .join('\n');
    }
    validateContent(content) {
        // Check if content is just repetitive titles
        const lines = content.split('\n').filter(line => line.trim());
        const uniqueLines = new Set(lines);
        // If more than 80% of lines are duplicates, it's likely repetitive
        const duplicateRatio = 1 - (uniqueLines.size / lines.length);
        if (duplicateRatio > 0.8) {
            logger_1.default.warn('Content appears to be repetitive');
            return false;
        }
        // Check if content has actual substance (more than just headers)
        const contentLines = lines.filter(line => !line.trim().startsWith('#') &&
            line.trim().length > 10);
        if (contentLines.length < 5) {
            logger_1.default.warn('Content appears to lack substance');
            return false;
        }
        return true;
    }
    generateFallbackContent(topic, summaries, structure) {
        return `# Análisis Financiero: ${topic}

## Resumen Ejecutivo

### Puntos Clave
Este análisis examina ${topic} basándose en la información disponible de múltiples fuentes. Los datos recopilados incluyen información financiera, análisis de mercado y perspectivas de inversión.

### Recomendación de Inversión
Basándose en el análisis de los datos disponibles, se presenta una evaluación comprehensiva para la toma de decisiones de inversión.

## Descripción de la Empresa

### Modelo de Negocio
${topic} opera en un sector dinámico con múltiples oportunidades de crecimiento y desafíos competitivos.

### Posición Competitiva
La empresa mantiene una posición en el mercado que requiere análisis continuo de sus fortalezas y debilidades competitivas.

## Análisis Financiero

### Métricas Financieras Clave
Los indicadores financieros principales muestran el rendimiento actual y las tendencias históricas de la empresa.

### Rendimiento Histórico
El análisis histórico proporciona contexto para entender la evolución financiera y operacional.

### Análisis de Rentabilidad
La evaluación de la rentabilidad incluye márgenes, retorno sobre inversión y eficiencia operacional.

## Análisis de Mercado

### Tamaño y Crecimiento del Mercado
El mercado presenta oportunidades de crecimiento que deben evaluarse en el contexto competitivo actual.

### Tendencias del Sector
Las tendencias sectoriales influyen significativamente en las perspectivas futuras de la empresa.

### Análisis Competitivo
La posición competitiva requiere evaluación continua frente a los principales competidores del sector.

## Evaluación de Riesgos

### Riesgos Operacionales
Los riesgos operacionales incluyen factores internos que pueden afectar el rendimiento empresarial.

### Riesgos de Mercado
Los riesgos de mercado abarcan factores externos que pueden impactar la valoración y el rendimiento.

### Riesgos Regulatorios
El entorno regulatorio presenta consideraciones importantes para la estrategia empresarial.

## Recomendación de Inversión

### Valoración
La valoración se basa en múltiples metodologías y considera factores cuantitativos y cualitativos.

### Perspectivas Futuras
Las perspectivas futuras dependen de la ejecución estratégica y las condiciones del mercado.

### Conclusiones
Este análisis proporciona una base para la evaluación de la oportunidad de inversión en ${topic}.

---

*Nota: Este análisis se basa en la información disponible y debe complementarse con análisis adicional para decisiones de inversión.*`;
    }
    invoke(state) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!state.searchResults || state.searchResults.length === 0) {
                throw new Error('No search results available to generate content');
            }
            if (!state.documentStructure) {
                throw new Error('No document structure available to generate content');
            }
            const summaries = this.concatenateSummaries(state);
            if (!summaries) {
                throw new Error('No summaries available to generate content');
            }
            logger_1.default.info('Generating final document content...');
            try {
                const formattedPrompt = yield this.prompt.format({
                    topic: state.researchQuery,
                    summaries,
                    structure: state.documentStructure
                });
                logger_1.default.debug('Sending prompt to model for content generation');
                // Add timeout and retry logic for Ollama calls
                let response;
                let retryCount = 0;
                const maxRetries = 3;
                while (retryCount < maxRetries) {
                    try {
                        response = yield Promise.race([
                            this.model.invoke(formattedPrompt),
                            new Promise((_, reject) => setTimeout(() => reject(new Error('Ollama timeout')), 90000) // Increased to 90 seconds
                            )
                        ]);
                        // Break if we got a valid response
                        if (response && response.content !== undefined) {
                            break;
                        }
                        // If response is invalid, treat as error and retry
                        throw new Error('Invalid response from Ollama - content is undefined');
                    }
                    catch (error) {
                        retryCount++;
                        logger_1.default.warn(`Ollama call failed for content generation (attempt ${retryCount}/${maxRetries}):`, error);
                        if (retryCount >= maxRetries) {
                            throw error;
                        }
                        // Wait before retry
                        yield new Promise(resolve => setTimeout(resolve, 3000 * retryCount));
                    }
                }
                if (!response || response.content === undefined || response.content === null) {
                    logger_1.default.warn('Invalid response from model, using fallback content');
                    return Object.assign(Object.assign({}, state), { finalDocument: this.generateFallbackContent(state.researchQuery, summaries, state.documentStructure) });
                }
                const finalDocument = response.content.toString();
                if (!finalDocument || finalDocument.trim().length === 0) {
                    logger_1.default.warn('Empty content generated, using fallback');
                    return Object.assign(Object.assign({}, state), { finalDocument: this.generateFallbackContent(state.researchQuery, summaries, state.documentStructure) });
                }
                // Validate content quality
                if (!this.validateContent(finalDocument)) {
                    logger_1.default.warn('Generated content failed validation, using fallback');
                    return Object.assign(Object.assign({}, state), { finalDocument: this.generateFallbackContent(state.researchQuery, summaries, state.documentStructure) });
                }
                logger_1.default.info('Document content generated successfully');
                logger_1.default.debug('Generated content length:', finalDocument.length);
                return Object.assign(Object.assign({}, state), { finalDocument });
            }
            catch (error) {
                logger_1.default.error('Error generating document content:', error);
                logger_1.default.info('Using fallback content due to error');
                return Object.assign(Object.assign({}, state), { finalDocument: this.generateFallbackContent(state.researchQuery, summaries, state.documentStructure) });
            }
        });
    }
}
exports.ContentGeneratorBrain = ContentGeneratorBrain;
