import { functionCallExtractor } from './factories/functionCall';
import { methodCallExtractor } from './factories/methodCall';
import { callExpressionExtractor } from './factories/callExpression';

export abstract class JsExtractors {
    public static functionCall: typeof functionCallExtractor = functionCallExtractor;
    public static methodCall: typeof methodCallExtractor = methodCallExtractor;
    public static callExpression: typeof callExpressionExtractor = callExpressionExtractor;
}
