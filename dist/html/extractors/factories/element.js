"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.elementExtractor = void 0;
const selector_1 = require("../../selector");
const utils_1 = require("../../utils");
const content_1 = require("../../../utils/content");
function elementExtractor(selector, textExtractor, options = {}) {
    let selectors = new selector_1.ElementSelectorSet(selector);
    return (node, fileName, addMessage) => {
        if (typeof node.tagName !== 'string') {
            return;
        }
        let element = node;
        if (selectors.anyMatch(element)) {
            let context, textPlural, comments = [], contentOptions = content_1.getContentOptions(options, {
                trimWhiteSpace: true,
                preserveIndentation: false,
                replaceNewLines: false
            });
            if (options.attributes && options.attributes.context) {
                context = utils_1.HtmlUtils.getNormalizedAttributeValue(element, options.attributes.context, contentOptions) || undefined;
            }
            if (options.attributes && options.attributes.textPlural) {
                textPlural = utils_1.HtmlUtils.getNormalizedAttributeValue(element, options.attributes.textPlural, contentOptions) || undefined;
            }
            if (options.attributes && options.attributes.comment) {
                let comment = utils_1.HtmlUtils.getNormalizedAttributeValue(element, options.attributes.comment, contentOptions);
                if (comment) {
                    comments.push(comment);
                }
            }
            let text = textExtractor(element);
            if (typeof text === 'string') {
                addMessage({ text, context, textPlural, comments });
            }
        }
    };
}
exports.elementExtractor = elementExtractor;
