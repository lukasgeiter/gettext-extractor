"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.elementAttributeExtractor = void 0;
const utils_1 = require("../../utils");
const element_1 = require("./element");
const validate_1 = require("../../../utils/validate");
const common_1 = require("../common");
const content_1 = require("../../../utils/content");
function elementAttributeExtractor(selector, textAttribute, options = {}) {
    validate_1.Validate.required.nonEmptyString({ selector, textAttribute });
    common_1.validateOptions(options);
    content_1.validateContentOptions(options);
    let contentOptions = content_1.getContentOptions(options, {
        trimWhiteSpace: false,
        preserveIndentation: true,
        replaceNewLines: false
    });
    return element_1.elementExtractor(selector, element => {
        return utils_1.HtmlUtils.getNormalizedAttributeValue(element, textAttribute, contentOptions);
    }, options);
}
exports.elementAttributeExtractor = elementAttributeExtractor;
