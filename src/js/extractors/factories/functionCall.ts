import * as ts from 'typescript';

import { IJsExtractorFunction } from '../../parser';
import { JsCommentUtils } from '../comments';
import { IAddMessageCallback } from '../../../parser';
import { Validate } from '../../../utils/validate';
import { extractArguments, IOptions, validateOptions } from '../common';

export function functionCallExtractor(functionName: string, options: IOptions): IJsExtractorFunction {
    Validate.required.nonEmptyString({functionName});
    validateOptions(options);

    return (node: ts.Node, sourceFile: ts.SourceFile, addMessage: IAddMessageCallback) => {
        if (node.kind === ts.SyntaxKind.CallExpression) {
            let callExpression = <ts.CallExpression>node;
            if (callExpression.expression.kind === ts.SyntaxKind.Identifier) {
                let functionIdentifier = <ts.Identifier>callExpression.expression;

                if (functionIdentifier.text === functionName) {
                    let message = extractArguments(callExpression, options.arguments);
                    if (message) {
                        message.comments = JsCommentUtils.extractComments(callExpression, sourceFile, options.comments);
                        addMessage(message);
                    }
                }
            }
        }
    };
}
