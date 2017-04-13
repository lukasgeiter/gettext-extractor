import * as ts from 'typescript';
import { IArgumentIndexMapping, IJsExtractorOptions } from '../common';
import { IJsExtractorFunction } from '../../parser';
import { IAddMessageCallback, IMessageData } from '../../../parser';
import { JsCommentUtils } from '../comments';

export type ICallExpressionPredicate = (callExpression: ts.CallExpression) => boolean;

export function extractArguments(callExpression: ts.CallExpression, argumentMapping: IArgumentIndexMapping): IMessageData {
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

export function callExpressionExtractor(predicate: ICallExpressionPredicate, options: IJsExtractorOptions): IJsExtractorFunction {
    return (node: ts.Node, sourceFile: ts.SourceFile, addMessage: IAddMessageCallback) => {
        if (node.kind === ts.SyntaxKind.CallExpression) {
            let callExpression = <ts.CallExpression>node;
            if (predicate(callExpression)) {
                let message = extractArguments(callExpression, options.arguments);
                if (message) {
                    message.comments = JsCommentUtils.extractComments(callExpression, sourceFile, options.comments);
                    addMessage(message);
                }
            }
        }
    };
}
