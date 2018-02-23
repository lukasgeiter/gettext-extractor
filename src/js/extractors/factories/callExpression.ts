import * as ts from 'typescript';

import { IJsExtractorFunction } from '../../parser';
import { Validate } from '../../../utils/validate';
import { IContentOptions, normalizeContent, validateContentOptions } from '../../../utils/content';
import { IJsExtractorOptions, validateOptions, IArgumentIndexMapping } from '../common';
import { JsUtils } from '../../utils';
import { IAddMessageCallback, IMessageData } from '../../../parser';
import { JsCommentUtils } from '../comments';

export function callExpressionExtractor(calleeName: string | string[], options: IJsExtractorOptions): IJsExtractorFunction {
    Validate.required.argument({calleeName});

    let calleeNames = [].concat(calleeName);

    for (let name of calleeNames) {
        if (typeof name !== 'string' || name.length === 0) {
            throw new TypeError(`Argument 'calleeName' must be a non-empty string or an array containing non-empty strings`);
        }
    }

    validateOptions(options);
    validateContentOptions(options);

    let contentOptions: IContentOptions = {
        trimWhiteSpace: false,
        preserveIndentation: true,
        replaceNewLines: false
    };

    if (options.content) {
        if (options.content.trimWhiteSpace !== undefined) {
            contentOptions.trimWhiteSpace = options.content.trimWhiteSpace;
        }
        if (options.content.preserveIndentation !== undefined) {
            contentOptions.preserveIndentation = options.content.preserveIndentation;
        }
        if (options.content.replaceNewLines !== undefined) {
            contentOptions.replaceNewLines = options.content.replaceNewLines;
        }
    }

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

function extractArguments(callExpression: ts.CallExpression, argumentMapping: IArgumentIndexMapping, contentOptions: IContentOptions): IMessageData {
    let callArguments = callExpression.arguments;
    let textArgument = callArguments[argumentMapping.text],
        textPluralArgument = callArguments[argumentMapping.textPlural],
        contextArgument = callArguments[argumentMapping.context];

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
