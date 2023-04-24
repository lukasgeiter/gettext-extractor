"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateOptions = void 0;
const validate_1 = require("../../utils/validate");
function validateOptions(options) {
    validate_1.Validate.optional.stringProperty(options, 'options.attributes.textPlural');
    validate_1.Validate.optional.stringProperty(options, 'options.attributes.context');
    validate_1.Validate.optional.stringProperty(options, 'options.attributes.comment');
}
exports.validateOptions = validateOptions;
