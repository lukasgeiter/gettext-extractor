import { callExpressionExtractor } from './factories/callExpression';

export abstract class JsExtractors {
    public static callExpression: typeof callExpressionExtractor = callExpressionExtractor;
}
