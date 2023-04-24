"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateOptions = void 0;
const validate_1 = require("../../utils/validate");
function validateOptions(options) {
    validate_1.Validate.required.numberProperty(options, 'options.arguments.text');
    validate_1.Validate.optional.numberProperty(options, 'options.arguments.textPlural');
    validate_1.Validate.optional.numberProperty(options, 'options.arguments.context');
    validate_1.Validate.optional.regexProperty(options, 'options.comments.regex');
    validate_1.Validate.optional.booleanProperty(options, 'options.comments.otherLineLeading');
    validate_1.Validate.optional.booleanProperty(options, 'options.comments.sameLineLeading');
    validate_1.Validate.optional.booleanProperty(options, 'options.comments.sameLineTrailing');
}
exports.validateOptions = validateOptions;
