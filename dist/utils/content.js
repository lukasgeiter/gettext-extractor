"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeContent = exports.validateContentOptions = exports.getContentOptions = void 0;
const validate_1 = require("./validate");
function getContentOptions(extractorOptions, defaultOptions) {
    let contentOptions = defaultOptions;
    if (extractorOptions.content) {
        if (extractorOptions.content.trimWhiteSpace !== undefined) {
            contentOptions.trimWhiteSpace = extractorOptions.content.trimWhiteSpace;
        }
        if (extractorOptions.content.preserveIndentation !== undefined) {
            contentOptions.preserveIndentation = extractorOptions.content.preserveIndentation;
        }
        if (extractorOptions.content.replaceNewLines !== undefined) {
            contentOptions.replaceNewLines = extractorOptions.content.replaceNewLines;
        }
    }
    return contentOptions;
}
exports.getContentOptions = getContentOptions;
function validateContentOptions(options) {
    validate_1.Validate.optional.booleanProperty(options, 'options.content.trimWhiteSpace');
    validate_1.Validate.optional.booleanProperty(options, 'options.content.preserveIndentation');
    if (options.content && options.content.replaceNewLines !== undefined
        && options.content.replaceNewLines !== false && typeof options.content.replaceNewLines !== 'string') {
        throw new TypeError(`Property 'options.content.replaceNewLines' must be false or a string`);
    }
}
exports.validateContentOptions = validateContentOptions;
function normalizeContent(content, options) {
    content = content.replace(/\r\n/g, '\n');
    if (options.trimWhiteSpace) {
        if (options.preserveIndentation) {
            // trim whitespace while preserving indentation
            // uses regex constructor instead of literal to simplify documentation
            let contentWithIndentationRegex = new RegExp('^\\s*?' + // non-greedily matches whitespace in the beginning
                '(' +
                '[ \\t]*\\S' + // matches tabs or spaces in front of a non-whitespace character
                '[^]*?' + // non-greedily matches everything (including newlines) until the end (minus trailing whitespace)
                ')' +
                '\\s*$', // matches trailing whitespace
            'g');
            content = content.replace(contentWithIndentationRegex, '$1');
        }
        else {
            content = content.trim();
        }
    }
    if (!options.preserveIndentation) {
        content = content.replace(/^[ \t]+/mg, '');
    }
    if (typeof options.replaceNewLines === 'string') {
        content = content.replace(/\n/g, options.replaceNewLines);
    }
    return content;
}
exports.normalizeContent = normalizeContent;
