import * as ts from 'typescript';

import { IJsExtractorFunction } from './parser';
import { JsCommentUtils, ICommentOptions } from './comments';
import { IAddMessageCallback, IMessageData } from '../parser';
import { Validate } from '../utils/validate';

export interface IArgumentIndexMapping {
    text: number;
    textPlural?: number;
    context?: number;
}

export interface IOptions {
    arguments: IArgumentIndexMapping;
    comments?: ICommentOptions;
}

export interface IMethodCallOptions extends IOptions {
    ignoreMemberInstance?: boolean;
}

export abstract class JsExtractors {

    public static functionCall(functionName: string, options: IOptions): IJsExtractorFunction {
        Validate.required.nonEmptyString({functionName});
        JsExtractors.validateOptions(options);

        return (node: ts.Node, sourceFile: ts.SourceFile, addMessage: IAddMessageCallback) => {
            if (node.kind === ts.SyntaxKind.CallExpression) {
                let callExpression = <ts.CallExpression>node;
                if (callExpression.expression.kind === ts.SyntaxKind.Identifier) {
                    let functionIdentifier = <ts.Identifier>callExpression.expression;

                    if (functionIdentifier.text === functionName) {
                        let message = this.extractArguments(callExpression, options.arguments);
                        if (message) {
                            message.comments = JsCommentUtils.extractComments(callExpression, sourceFile, options.comments);
                            addMessage(message);
                        }
                    }
                }
            }
        };
    }

    public static methodCall(instanceName: string, functionName: string, options: IMethodCallOptions): IJsExtractorFunction {
        Validate.required.nonEmptyString({instanceName, functionName});
        JsExtractors.validateOptions(options);

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
                        let memberIdentifier = <ts.Identifier>propertyAccessExpression.name;

                        if (instanceIdentifier.text === instanceName
                            && memberIdentifier.text === functionName) {
                            let message = this.extractArguments(callExpression, options.arguments);
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

    private static validateOptions(options: IOptions): void {
        Validate.required.numberProperty(options, 'options.arguments.text');
        Validate.optional.numberProperty(options, 'options.arguments.textPlural');
        Validate.optional.numberProperty(options, 'options.arguments.context');
        Validate.optional.regexProperty(options, 'options.comments.regex');
        Validate.optional.booleanProperty(options, 'options.comments.otherLineLeading');
        Validate.optional.booleanProperty(options, 'options.comments.sameLineLeading');
        Validate.optional.booleanProperty(options, 'options.comments.sameLineTrailing');
    }

    private static extractArguments(callExpression: ts.CallExpression, argumentMapping: IArgumentIndexMapping): IMessageData {
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
}
