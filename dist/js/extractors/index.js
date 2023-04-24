"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsExtractors = void 0;
const callExpression_1 = require("./factories/callExpression");
const htmlTemplate_1 = require("./factories/htmlTemplate");
class JsExtractors {
}
exports.JsExtractors = JsExtractors;
JsExtractors.callExpression = callExpression_1.callExpressionExtractor;
JsExtractors.htmlTemplate = htmlTemplate_1.htmlTemplateExtractor;
