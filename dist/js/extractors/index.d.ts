import { callExpressionExtractor } from './factories/callExpression';
import { htmlTemplateExtractor } from './factories/htmlTemplate';
export declare abstract class JsExtractors {
    static callExpression: typeof callExpressionExtractor;
    static htmlTemplate: typeof htmlTemplateExtractor;
}
