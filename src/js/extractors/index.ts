import { functionCallExtractor } from './factories/functionCall';
import { methodCallExtractor } from './factories/methodCall';

export abstract class JsExtractors {
    public static functionCall: typeof functionCallExtractor = functionCallExtractor;
    public static methodCall: typeof methodCallExtractor = methodCallExtractor;
}
