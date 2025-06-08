"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractFromTags = exports.removeThinkingTags = void 0;
const removeThinkingTags = (text) => {
    return text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
};
exports.removeThinkingTags = removeThinkingTags;
const extractFromTags = (text, tag) => {
    const regex = new RegExp(`<${tag}>(.*?)<\/${tag}>`, 's');
    const match = text.match(regex);
    return match ? match[1].trim() : '';
};
exports.extractFromTags = extractFromTags;
