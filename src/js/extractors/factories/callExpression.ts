import * as ts from 'typescript';

import { IJsExtractorFunction } from '../../parser';
import { Validate } from '../../../utils/validate';
import { IContentOptions, normalizeContent, getContentOptions, validateContentOptions } from '../../../utils/content';
import { IJsExtractorOptions, validateOptions, IArgumentIndexMapping } from '../common';
import { JsUtils } from '../../utils';
import { IAddMessageCallback, IMessageData } from '../../../parser';
import { JsCommentUtils } from '../comments';

export function callExpressionExtractor(calleeName: string | string[], options: IJsExtractorOptions): IJsExtractorFunction {
    Validate.required.argument({calleeName});

    let calleeNames = ([] as string[]).concat(calleeName);

    for (let name of calleeNames) {
        if (typeof name !== 'string' || name.length === 0) {
            throw new TypeError(`Argument 'calleeName' must be a non-empty string or an array containing non-empty strings`);
        }
    }

    validateOptions(options);
    validateContentOptions(options);

    let contentOptions: IContentOptions = getContentOptions(options, {
        trimWhiteSpace: false,
        preserveIndentation: true,
        replaceNewLines: false
    });

    return (node: ts.Node, sourceFile: ts.SourceFile, addMessage: IAddMessageCallback) => {
        if (node.kind === ts.SyntaxKind.CallExpression) {
            let callExpression = <ts.CallExpression>node;

            let matches = calleeNames.reduce((matchFound, name) => (
                matchFound || JsUtils.calleeNameMatchesCallExpression(name, callExpression)
            ), false);

            if (matches) {
                let message = extractArguments(callExpression, options.arguments, contentOptions);
                if (message) {
                    message.comments = JsCommentUtils.extractComments(callExpression, sourceFile, options.comments);
                    addMessage(message);
                }
            }
        }
    };
}

function extractArguments(callExpression: ts.CallExpression, argumentMapping: IArgumentIndexMapping, contentOptions: IContentOptions): IMessageData | null {
    let callArguments = callExpression.arguments;
    let textArgument: ts.Expression | undefined = callArguments[argumentMapping.text],
        textPluralArgument: ts.Expression | undefined = callArguments[argumentMapping.textPlural!],
        contextArgument: ts.Expression | undefined = callArguments[argumentMapping.context!];

    textArgument = checkAndConcatenateStrings(textArgument);
    textPluralArgument = checkAndConcatenateStrings(textPluralArgument);

    let textPluralValid = typeof argumentMapping.textPlural !== 'number' || isTextLiteral(textPluralArgument);

    if (isTextLiteral(textArgument) && textPluralValid) {
        let message: IMessageData = {
            text: normalizeContent(textArgument.text, contentOptions)
        };

        if (isTextLiteral(textPluralArgument)) {
            message.textPlural = normalizeContent(textPluralArgument.text, contentOptions);
        }
        if (isTextLiteral(contextArgument)) {
            message.context = normalizeContent(contextArgument.text, contentOptions);
        }

        return message;
    }

    return null;
}

function isTextLiteral(expression: ts.Expression): expression is ts.LiteralExpression {
    return expression && (expression.kind === ts.SyntaxKind.StringLiteral || expression.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral);
}

function isParenthesizedExpression(expression: ts.Expression): expression is ts.ParenthesizedExpression {
    return expression && expression.kind === ts.SyntaxKind.ParenthesizedExpression;
}

function isBinaryExpression(expression: ts.Expression): expression is ts.BinaryExpression {
    return expression && expression.kind === ts.SyntaxKind.BinaryExpression;
}

function createStringLiteral(text: string): ts.StringLiteral {
    const node = <ts.StringLiteral>ts.createNode(ts.SyntaxKind.StringLiteral, -1, -1);
    node.text = text;
    return node;
}

function getAdditionExpression(expression: ts.Expression): ts.BinaryExpression | null {
    while (isParenthesizedExpression(expression)) {
        expression = expression.expression;
    }

    if (isBinaryExpression(expression) && expression.operatorToken.kind === ts.SyntaxKind.PlusToken) {
        return expression;
    }

    return null;
}

function checkAndConcatenateStrings(expression: ts.Expression): ts.Expression {
    let addition: ts.BinaryExpression | null;

    if (!expression || !(addition = getAdditionExpression(expression))) {
        return expression;
    }

    let concatenated = createStringLiteral('');

    if (processStringAddition(addition, concatenated)) {
        return concatenated;
    }

    return expression;
}

function processStringAddition(expression: ts.BinaryExpression, concatenated: ts.StringLiteral): boolean {
    let addition: ts.BinaryExpression | null;

    if (isTextLiteral(expression.left)) {
        concatenated.text += expression.left.text;
    } else if (addition = getAdditionExpression(expression.left)) {
        if (!processStringAddition(addition, concatenated)) {
            return false;
        }
    } else {
        return false;
    }

    if (isTextLiteral(expression.right)) {
        concatenated.text += expression.right.text;
        return true;
    } else if (addition = getAdditionExpression(expression.right)) {
        return processStringAddition(addition, concatenated);
    } else {
        return false;
    }
}
