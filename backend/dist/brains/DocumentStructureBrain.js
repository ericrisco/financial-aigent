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
exports.DocumentStructureBrain = void 0;
const ollama_1 = require("@langchain/community/chat_models/ollama");
const config_1 = require("../config/config");
const document_structure_prompt_1 = require("./prompts/document-structure.prompt");
const prompts_1 = require("@langchain/core/prompts");
const text_utils_1 = require("../utils/text.utils");
const logger_1 = __importDefault(require("../utils/logger"));
class DocumentStructureBrain {
    constructor() {
        this.model = new ollama_1.ChatOllama({
            baseUrl: config_1.config.llm.ollamaBaseUrl,
            model: config_1.config.llm.thinkingModel,
            temperature: 0
        });
        this.prompt = prompts_1.PromptTemplate.fromTemplate(document_structure_prompt_1.DOCUMENT_STRUCTURE_PROMPT);
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
    generateFallbackStructure(topic) {
        return `# Análisis Financiero: ${topic}

## Resumen Ejecutivo
### Puntos Clave
### Recomendación de Inversión

## Descripción de la Empresa
### Modelo de Negocio
### Posición Competitiva

## Análisis Financiero
### Métricas Financieras Clave
### Rendimiento Histórico
### Análisis de Rentabilidad

## Análisis de Mercado
### Tamaño y Crecimiento del Mercado
### Tendencias del Sector
### Análisis Competitivo

## Evaluación de Riesgos
### Riesgos Operacionales
### Riesgos de Mercado
### Riesgos Regulatorios

## Recomendación de Inversión
### Valoración
### Perspectivas Futuras
### Conclusiones`;
    }
    invoke(state) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!state.searchResults || state.searchResults.length === 0) {
                throw new Error('No search results available to create document structure');
            }
            const summaries = this.concatenateSummaries(state);
            if (!summaries) {
                throw new Error('No summaries available to create document structure');
            }
            logger_1.default.info('Generating document structure...');
            try {
                const formattedPrompt = yield this.prompt.format({
                    topic: state.researchQuery,
                    summaries
                });
                logger_1.default.debug('Sending prompt to model for structure generation');
                // Add timeout and retry logic for Ollama calls
                let response;
                let retryCount = 0;
                const maxRetries = 3;
                while (retryCount < maxRetries) {
                    try {
                        response = yield Promise.race([
                            this.model.invoke(formattedPrompt),
                            new Promise((_, reject) => setTimeout(() => reject(new Error('Ollama timeout')), 75000) // Increased to 75 seconds
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
                        logger_1.default.warn(`Ollama call failed for structure generation (attempt ${retryCount}/${maxRetries}):`, error);
                        if (retryCount >= maxRetries) {
                            throw error;
                        }
                        // Wait before retry
                        yield new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
                    }
                }
                if (!response || response.content === undefined || response.content === null) {
                    logger_1.default.warn('Invalid response from model, using fallback structure');
                    return Object.assign(Object.assign({}, state), { documentStructure: this.generateFallbackStructure(state.researchQuery) });
                }
                const responseContent = response.content.toString();
                logger_1.default.debug('Raw model response:', responseContent.substring(0, 200) + '...');
                let documentStructure = (0, text_utils_1.extractFromTags)(responseContent, 'structure');
                if (!documentStructure || documentStructure.trim().length === 0) {
                    logger_1.default.warn('Failed to extract structure from tags, trying direct extraction');
                    // Try to find structure without tags
                    const lines = responseContent.split('\n');
                    const structureLines = lines.filter((line) => line.trim().startsWith('#') ||
                        line.trim().startsWith('##') ||
                        line.trim().startsWith('###'));
                    if (structureLines.length > 0) {
                        documentStructure = structureLines.join('\n');
                        logger_1.default.info('Extracted structure without tags');
                    }
                    else {
                        logger_1.default.warn('No valid structure found, using fallback');
                        documentStructure = this.generateFallbackStructure(state.researchQuery);
                    }
                }
                logger_1.default.info('Document structure generated successfully');
                logger_1.default.debug('Generated structure:', documentStructure.substring(0, 300) + '...');
                return Object.assign(Object.assign({}, state), { documentStructure });
            }
            catch (error) {
                logger_1.default.error('Error generating document structure:', error);
                logger_1.default.info('Using fallback structure due to error');
                return Object.assign(Object.assign({}, state), { documentStructure: this.generateFallbackStructure(state.researchQuery) });
            }
        });
    }
}
exports.DocumentStructureBrain = DocumentStructureBrain;
