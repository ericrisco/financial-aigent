import toolsDescriptions from '../tools/tools-descriptions.json';

export function formatToolsForPrompt(): string {
  return Object.entries(toolsDescriptions)
    .map(([toolName, description], index) => `${index + 1}. ${toolName} - ${description}`)
    .join('\n');
}

export function getToolDescription(toolName: string): string {
  return toolsDescriptions[toolName as keyof typeof toolsDescriptions] || '';
}

export { toolsDescriptions }; 