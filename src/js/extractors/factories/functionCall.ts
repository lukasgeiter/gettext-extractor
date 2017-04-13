import * as ts from 'typescript';

import { IJsExtractorFunction } from '../../parser';
import { Validate } from '../../../utils/validate';
import { IJsExtractorOptions, validateOptions } from '../common';
import { callExpressionExtractor } from './callExpression';

export function functionCallExtractor(functionName: string, options: IJsExtractorOptions): IJsExtractorFunction {
    Validate.required.nonEmptyString({functionName});
    validateOptions(options);

    return callExpressionExtractor(callExpression => {
        return callExpression.expression.kind === ts.SyntaxKind.Identifier
            && (<ts.Identifier>callExpression.expression).text === functionName;
    }, options);
}
