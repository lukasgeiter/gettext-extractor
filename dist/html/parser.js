"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HtmlParser = void 0;
const parse5 = require("parse5");
const parser_1 = require("../parser");
class HtmlParser extends parser_1.Parser {
    parse(source, fileName, options = {}) {
        let document = parse5.parse(source, { sourceCodeLocationInfo: true });
        return this.parseNode(document, fileName, options.lineNumberStart || 1);
    }
    parseNode(node, fileName, lineNumberStart) {
        let messages = [];
        let addMessageCallback = parser_1.Parser.createAddMessageCallback(messages, fileName, () => {
            if (node.sourceCodeLocation && node.sourceCodeLocation.startLine) {
                return lineNumberStart + node.sourceCodeLocation.startLine - 1;
            }
        });
        for (let extractor of this.extractors) {
            extractor(node, fileName, addMessageCallback, lineNumberStart);
        }
        let childNodes = node.content ? node.content.childNodes : node.childNodes;
        if (childNodes) {
            for (let n of childNodes) {
                messages = messages.concat(this.parseNode(n, fileName, lineNumberStart));
            }
        }
        return messages;
    }
}
exports.HtmlParser = HtmlParser;
