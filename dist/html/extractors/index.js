"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HtmlExtractors = void 0;
const elementAttribute_1 = require("./factories/elementAttribute");
const elementContent_1 = require("./factories/elementContent");
const embeddedAttributeJs_1 = require("./factories/embeddedAttributeJs");
const embeddedJs_1 = require("./factories/embeddedJs");
class HtmlExtractors {
}
exports.HtmlExtractors = HtmlExtractors;
HtmlExtractors.elementContent = elementContent_1.elementContentExtractor;
HtmlExtractors.elementAttribute = elementAttribute_1.elementAttributeExtractor;
HtmlExtractors.embeddedJs = embeddedJs_1.embeddedJsExtractor;
HtmlExtractors.embeddedAttributeJs = embeddedAttributeJs_1.embeddedAttributeJsExtractor;
