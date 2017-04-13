import * as ts from 'typescript';

import { IJsExtractorFunction } from '../../parser';
import { JsCommentUtils } from '../comments';
import { IAddMessageCallback } from '../../../parser';
import { Validate } from '../../../utils/validate';
import { extractArguments, IOptions, validateOptions } from '../common';

export interface IMethodCallOptions extends IOptions {
    ignoreMemberInstance?: boolean;
}

export function methodCallExtractor(instanceName: string, methodName: string, options: IMethodCallOptions): IJsExtractorFunction {
    Validate.required.nonEmptyString({instanceName, methodName});
    validateOptions(options);

    return (node: ts.Node, sourceFile: ts.SourceFile, addMessage: IAddMessageCallback) => {
        if (node.kind === ts.SyntaxKind.CallExpression) {
            let callExpression = <ts.CallExpression>node;
            if (callExpression.expression.kind === ts.SyntaxKind.PropertyAccessExpression) {
                let propertyAccessExpression = <ts.PropertyAccessExpression>callExpression.expression;

                if (!options.ignoreMemberInstance && propertyAccessExpression.expression.kind === ts.SyntaxKind.PropertyAccessExpression) {
                    let subPropertyAccessExpression = <ts.PropertyAccessExpression>propertyAccessExpression.expression;
                    if (subPropertyAccessExpression.expression.kind === ts.SyntaxKind.ThisKeyword) {
                        propertyAccessExpression.expression = subPropertyAccessExpression.name;
                    }
                }

                if (propertyAccessExpression.expression.kind === ts.SyntaxKind.Identifier
                    && propertyAccessExpression.name.kind === ts.SyntaxKind.Identifier) {
                    let instanceIdentifier = <ts.Identifier>propertyAccessExpression.expression;
                    let methodIdentifier = <ts.Identifier>propertyAccessExpression.name;

                    if (instanceIdentifier.text === instanceName
                        && methodIdentifier.text === methodName) {
                        let message = extractArguments(callExpression, options.arguments);
                        if (message) {
                            message.comments = JsCommentUtils.extractComments(callExpression, sourceFile, options.comments);
                            addMessage(message);
                        }
                    }
                }
            }
        }
    };
}
