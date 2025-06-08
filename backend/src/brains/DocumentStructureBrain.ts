import { ChatOllama } from '@langchain/community/chat_models/ollama';
import { config } from '../config/config';
import { DOCUMENT_STRUCTURE_PROMPT } from './prompts/document-structure.prompt';
import { ResearchState } from '../interfaces/state.interface';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';
import { extractFromTags } from '../utils/text.utils';
import logger from '../utils/logger';

export class DocumentStructureBrain {
  private model: ChatOllama;
  private prompt: PromptTemplate;

  constructor() {
    this.model = new ChatOllama({
      baseUrl: config.llm.ollamaBaseUrl,
      model: config.llm.thinkingModel,
      temperature: 0
    });

    this.prompt = PromptTemplate.fromTemplate(DOCUMENT_STRUCTURE_PROMPT);
  }

  private concatenateSummaries(state: ResearchState): string {
    if (!state.searchResults) return '';

    return state.searchResults
      .map((result, index) => {
        if (!result.summary) return '';
        return `Source ${index + 1}:\n${result.summary}\n`;
      })
      .join('\n');
  }

  private generateFallbackStructure(topic: string): string {
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

  async invoke(state: ResearchState): Promise<ResearchState> {
    if (!state.searchResults || state.searchResults.length === 0) {
      throw new Error('No search results available to create document structure');
    }

    const summaries = this.concatenateSummaries(state);
    
    if (!summaries) {
      throw new Error('No summaries available to create document structure');
    }

    logger.info('Generating document structure...');

    try {
      const formattedPrompt = await this.prompt.format({
        topic: state.researchQuery,
        summaries
      });

      logger.debug('Sending prompt to model for structure generation');
      
      // Add timeout and retry logic for Ollama calls
      let response: any;
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          response = await Promise.race([
            this.model.invoke(formattedPrompt),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Ollama timeout')), 75000) // Increased to 75 seconds
            )
          ]);
          
          // Break if we got a valid response
          if (response && response.content !== undefined) {
            break;
          }
          
          // If response is invalid, treat as error and retry
          throw new Error('Invalid response from Ollama - content is undefined');
          
        } catch (error) {
          retryCount++;
          logger.warn(`Ollama call failed for structure generation (attempt ${retryCount}/${maxRetries}):`, error);
          
          if (retryCount >= maxRetries) {
            throw error;
          }
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
        }
      }
      
      if (!response || response.content === undefined || response.content === null) {
        logger.warn('Invalid response from model, using fallback structure');
        return {
          ...state,
          documentStructure: this.generateFallbackStructure(state.researchQuery)
        };
      }

      const responseContent = response.content.toString();
      logger.debug('Raw model response:', responseContent.substring(0, 200) + '...');

      let documentStructure = extractFromTags(responseContent, 'structure');

      if (!documentStructure || documentStructure.trim().length === 0) {
        logger.warn('Failed to extract structure from tags, trying direct extraction');
        
        // Try to find structure without tags
        const lines = responseContent.split('\n');
        const structureLines = lines.filter((line: string) => 
          line.trim().startsWith('#') || 
          line.trim().startsWith('##') || 
          line.trim().startsWith('###')
        );
        
        if (structureLines.length > 0) {
          documentStructure = structureLines.join('\n');
          logger.info('Extracted structure without tags');
        } else {
          logger.warn('No valid structure found, using fallback');
          documentStructure = this.generateFallbackStructure(state.researchQuery);
        }
      }

      logger.info('Document structure generated successfully');
      logger.debug('Generated structure:', documentStructure.substring(0, 300) + '...');

      return {
        ...state,
        documentStructure
      };
    } catch (error) {
      logger.error('Error generating document structure:', error);
      logger.info('Using fallback structure due to error');
      
      return {
        ...state,
        documentStructure: this.generateFallbackStructure(state.researchQuery)
      };
    }
  }
} 