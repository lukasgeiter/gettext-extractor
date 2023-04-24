"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.htmlTemplateExtractor = void 0;
const ts = require("typescript");
const validate_1 = require("../../../utils/validate");
function htmlTemplateExtractor(htmlParser) {
    validate_1.Validate.required.argument({ htmlParser });
    return (node, sourceFile) => {
        if (node.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral) {
            const source = node.getText(sourceFile);
            const lineNumber = sourceFile.getLineAndCharacterOfPosition(node.getStart());
            htmlParser.parseString(source, sourceFile.fileName, { lineNumberStart: lineNumber.line });
        }
    };
}
exports.htmlTemplateExtractor = htmlTemplateExtractor;
