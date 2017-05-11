import * as ts from 'typescript';

import { IJsExtractorFunction } from '../../parser';
import { Validate } from '../../../utils/validate';
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

    return (node: ts.Node, sourceFile: ts.SourceFile, addMessage: IAddMessageCallback) => {
        if (node.kind === ts.SyntaxKind.CallExpression) {
            let callExpression = <ts.CallExpression>node;

            let matches = calleeNames.reduce((matchFound, name) => (
                matchFound || JsUtils.calleeNameMatchesCallExpression(name, callExpression)
            ), false);

            if (matches) {
                let message = extractArguments(callExpression, options.arguments);
                if (message) {
                    message.comments = JsCommentUtils.extractComments(callExpression, sourceFile, options.comments);
                    addMessage(message);
                }
            }
        }
    };
}

function extractArguments(callExpression: ts.CallExpression, argumentMapping: IArgumentIndexMapping): IMessageData {
    let callArguments = callExpression.arguments;
    let textArgument = callArguments[argumentMapping.text],
        textPluralArgument = callArguments[argumentMapping.textPlural],
        contextArgument = callArguments[argumentMapping.context];

    let textValid = textArgument && textArgument.kind === ts.SyntaxKind.StringLiteral,
        textPluralValid = typeof argumentMapping.textPlural !== 'number' || (textPluralArgument && textPluralArgument.kind === ts.SyntaxKind.StringLiteral);

    if (textValid && textPluralValid) {
        let message: IMessageData = {
            text: (<ts.StringLiteral>textArgument).text
        };

        if (textPluralArgument && textPluralArgument.kind === ts.SyntaxKind.StringLiteral) {
            message.textPlural = (<ts.StringLiteral>textPluralArgument).text;
        }
        if (contextArgument && contextArgument.kind === ts.SyntaxKind.StringLiteral) {
            message.context = (<ts.StringLiteral>contextArgument).text;
        }

        return message;
    }

    return null;
}
