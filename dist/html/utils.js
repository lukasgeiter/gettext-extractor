"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HtmlUtils = void 0;
const parse5 = require("parse5");
const content_1 = require("../utils/content");
class HtmlUtils {
    static getAttributeValue(element, attributeName) {
        for (let attribute of element.attrs) {
            if (attribute.name === attributeName) {
                return attribute.value;
            }
        }
        return null;
    }
    static getNormalizedAttributeValue(element, attributeName, options) {
        let value = HtmlUtils.getAttributeValue(element, attributeName);
        if (value === null) {
            return null;
        }
        return content_1.normalizeContent(value, options);
    }
    static getElementContent(element, options) {
        let content = parse5.serialize(element, {});
        // Un-escape characters that get escaped by parse5
        content = content
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>');
        return content_1.normalizeContent(content, options);
    }
}
exports.HtmlUtils = HtmlUtils;
