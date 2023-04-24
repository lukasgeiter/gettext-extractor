"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.callExpressionExtractor = void 0;
const ts = require("typescript");
const validate_1 = require("../../../utils/validate");
const content_1 = require("../../../utils/content");
const common_1 = require("../common");
const utils_1 = require("../../utils");
const comments_1 = require("../comments");
function callExpressionExtractor(calleeName, options) {
    validate_1.Validate.required.argument({ calleeName });
    let calleeNames = [].concat(calleeName);
    for (let name of calleeNames) {
        if (typeof name !== 'string' || name.length === 0) {
            throw new TypeError(`Argument 'calleeName' must be a non-empty string or an array containing non-empty strings`);
        }
    }
    common_1.validateOptions(options);
    content_1.validateContentOptions(options);
    let contentOptions = content_1.getContentOptions(options, {
        trimWhiteSpace: false,
        preserveIndentation: true,
        replaceNewLines: false
    });
    return (node, sourceFile, addMessage) => {
        if (node.kind === ts.SyntaxKind.CallExpression) {
            let callExpression = node;
            let matches = calleeNames.reduce((matchFound, name) => (matchFound || utils_1.JsUtils.calleeNameMatchesCallExpression(name, callExpression)), false);
            if (matches) {
                let message = extractArguments(callExpression, options.arguments, contentOptions);
                if (message) {
                    message.comments = comments_1.JsCommentUtils.extractComments(callExpression, sourceFile, options.comments);
                    addMessage(message);
                }
            }
        }
    };
}
exports.callExpressionExtractor = callExpressionExtractor;
function extractArguments(callExpression, argumentMapping, contentOptions) {
    let callArguments = callExpression.arguments;
    let textArgument = callArguments[argumentMapping.text], textPluralArgument = callArguments[argumentMapping.textPlural], contextArgument = callArguments[argumentMapping.context];
    textArgument = checkAndConcatenateStrings(textArgument);
    textPluralArgument = checkAndConcatenateStrings(textPluralArgument);
    let textPluralValid = typeof argumentMapping.textPlural !== 'number' || isTextLiteral(textPluralArgument);
    if (isTextLiteral(textArgument) && textPluralValid) {
        let message = {
            text: content_1.normalizeContent(textArgument.text, contentOptions)
        };
        if (isTextLiteral(textPluralArgument)) {
            message.textPlural = content_1.normalizeContent(textPluralArgument.text, contentOptions);
        }
        if (isTextLiteral(contextArgument)) {
            message.context = content_1.normalizeContent(contextArgument.text, contentOptions);
        }
        return message;
    }
    return null;
}
function isTextLiteral(expression) {
    return expression && (expression.kind === ts.SyntaxKind.StringLiteral || expression.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral);
}
function isParenthesizedExpression(expression) {
    return expression && expression.kind === ts.SyntaxKind.ParenthesizedExpression;
}
function isBinaryExpression(expression) {
    return expression && expression.kind === ts.SyntaxKind.BinaryExpression;
}
function getAdditionExpression(expression) {
    while (isParenthesizedExpression(expression)) {
        expression = expression.expression;
    }
    if (isBinaryExpression(expression) && expression.operatorToken.kind === ts.SyntaxKind.PlusToken) {
        return expression;
    }
    return null;
}
function checkAndConcatenateStrings(expression) {
    let addition;
    if (!expression || !(addition = getAdditionExpression(expression))) {
        return expression;
    }
    let concatenated = ts.factory.createStringLiteral('');
    if (processStringAddition(addition, concatenated)) {
        return concatenated;
    }
    return expression;
}
function processStringAddition(expression, concatenated) {
    let addition;
    if (isTextLiteral(expression.left)) {
        concatenated.text += expression.left.text;
    }
    else if (addition = getAdditionExpression(expression.left)) {
        if (!processStringAddition(addition, concatenated)) {
            return false;
        }
    }
    else {
        return false;
    }
    if (isTextLiteral(expression.right)) {
        concatenated.text += expression.right.text;
        return true;
    }
    else if (addition = getAdditionExpression(expression.right)) {
        return processStringAddition(addition, concatenated);
    }
    else {
        return false;
    }
}
