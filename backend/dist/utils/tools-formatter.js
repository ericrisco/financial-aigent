"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toolsDescriptions = void 0;
exports.formatToolsForPrompt = formatToolsForPrompt;
exports.getToolDescription = getToolDescription;
const tools_descriptions_json_1 = __importDefault(require("../tools/tools-descriptions.json"));
exports.toolsDescriptions = tools_descriptions_json_1.default;
function formatToolsForPrompt() {
    return Object.entries(tools_descriptions_json_1.default)
        .map(([toolName, description], index) => `${index + 1}. ${toolName} - ${description}`)
        .join('\n');
}
function getToolDescription(toolName) {
    return tools_descriptions_json_1.default[toolName] || '';
}
