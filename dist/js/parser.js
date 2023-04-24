"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsParser = void 0;
const ts = require("typescript");
const parser_1 = require("../parser");
class JsParser extends parser_1.Parser {
    parse(source, fileName, options = {}) {
        let sourceFile = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, options.scriptKind);
        return this.parseNode(sourceFile, sourceFile, options.lineNumberStart || 1);
    }
    parseNode(node, sourceFile, lineNumberStart) {
        let messages = [];
        let addMessageCallback = parser_1.Parser.createAddMessageCallback(messages, sourceFile.fileName, () => {
            let location = sourceFile.getLineAndCharacterOfPosition(node.getStart());
            return lineNumberStart + location.line;
        });
        for (let extractor of this.extractors) {
            extractor(node, sourceFile, addMessageCallback);
        }
        ts.forEachChild(node, n => {
            messages = messages.concat(this.parseNode(n, sourceFile, lineNumberStart));
        });
        return messages;
    }
}
exports.JsParser = JsParser;
