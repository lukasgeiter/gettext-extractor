import * as ts from 'typescript';

import { IJsExtractorFunction } from '../../parser';
import { Validate } from '../../../utils/validate';
import { IJsExtractorOptions, validateOptions } from '../common';
import { callExpressionExtractor } from './callExpression';

export interface IMethodCallOptions extends IJsExtractorOptions {
    ignoreMemberInstance?: boolean;
}

export function methodCallExtractor(instanceName: string, methodName: string, options: IMethodCallOptions): IJsExtractorFunction {
    Validate.required.nonEmptyString({instanceName, methodName});
    validateOptions(options);

    return callExpressionExtractor(callExpression => {
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

                return instanceIdentifier.text === instanceName
                    && methodIdentifier.text === methodName;
            }
        }
        return false;
    }, options);
}
