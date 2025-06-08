"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DOCUMENT_STRUCTURE_PROMPT = void 0;
exports.DOCUMENT_STRUCTURE_PROMPT = `You are a financial analysis expert. Create a clear Markdown structure for a financial analysis document.

TOPIC: {topic}

AVAILABLE DATA:
{summaries}

Create a professional document structure with these sections:
1. Executive Summary
2. Company Overview  
3. Financial Analysis
4. Market Analysis
5. Risk Assessment
6. Investment Recommendation

IMPORTANT RULES:
- Use proper Markdown headers (# ## ###)
- Include subsections under each main section
- Wrap your response in <structure></structure> tags
- Keep it simple and clear
- Focus on financial analysis structure

<structure>
# Análisis Financiero: {topic}

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
### Conclusiones
</structure>

Now create a similar structure for the given topic. Remember to wrap in <structure> tags.`;
