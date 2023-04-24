"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.elementContentExtractor = void 0;
const utils_1 = require("../../utils");
const validate_1 = require("../../../utils/validate");
const content_1 = require("../../../utils/content");
const common_1 = require("../common");
const element_1 = require("./element");
function elementContentExtractor(selector, options = {}) {
    validate_1.Validate.required.nonEmptyString({ selector });
    common_1.validateOptions(options);
    content_1.validateContentOptions(options);
    let contentOptions = content_1.getContentOptions(options, {
        trimWhiteSpace: true,
        preserveIndentation: false,
        replaceNewLines: false
    });
    return element_1.elementExtractor(selector, element => {
        return utils_1.HtmlUtils.getElementContent(element, contentOptions);
    }, options);
}
exports.elementContentExtractor = elementContentExtractor;
