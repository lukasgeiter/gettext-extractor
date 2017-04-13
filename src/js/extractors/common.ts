import * as ts from 'typescript';

import { Validate } from '../../utils/validate';
import { ICommentOptions } from './comments';
import { IMessageData } from '../../parser';

export interface IArgumentIndexMapping {
    text: number;
    textPlural?: number;
    context?: number;
}

export interface IOptions {
    arguments: IArgumentIndexMapping;
    comments?: ICommentOptions;
}

export function validateOptions(options: IOptions): void {
    Validate.required.numberProperty(options, 'options.arguments.text');
    Validate.optional.numberProperty(options, 'options.arguments.textPlural');
    Validate.optional.numberProperty(options, 'options.arguments.context');
    Validate.optional.regexProperty(options, 'options.comments.regex');
    Validate.optional.booleanProperty(options, 'options.comments.otherLineLeading');
    Validate.optional.booleanProperty(options, 'options.comments.sameLineLeading');
    Validate.optional.booleanProperty(options, 'options.comments.sameLineTrailing');
}

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
