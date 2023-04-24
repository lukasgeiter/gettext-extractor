"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.embeddedAttributeJsExtractor = void 0;
const validate_1 = require("../../../utils/validate");
function embeddedAttributeJsExtractor(filter, jsParser) {
    validate_1.Validate.required.argument({ filter });
    validate_1.Validate.required.argument({ jsParser });
    let test;
    if (typeof filter === 'function') {
        test = filter;
    }
    else {
        test = attr => filter.test(attr.name);
    }
    return (node, fileName, _, lineNumberStart) => {
        if (typeof node.tagName !== 'string') {
            return;
        }
        const element = node;
        element.attrs.filter(test).forEach((attr) => {
            var _a, _b;
            const startLine = (_b = (_a = element.sourceCodeLocation) === null || _a === void 0 ? void 0 : _a.attrs[attr.name]) === null || _b === void 0 ? void 0 : _b.startLine;
            if (startLine) {
                lineNumberStart = lineNumberStart + startLine - 1;
            }
            jsParser.parseString(attr.value, fileName, {
                lineNumberStart
            });
        });
    };
}
exports.embeddedAttributeJsExtractor = embeddedAttributeJsExtractor;
