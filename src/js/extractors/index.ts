import { callExpressionExtractor } from './factories/callExpression';
import { htmlTemplateExtractor } from './factories/htmlTemplate';

export abstract class JsExtractors {
    public static callExpression: typeof callExpressionExtractor = callExpressionExtractor;
    public static htmlTemplate: typeof htmlTemplateExtractor = htmlTemplateExtractor;
}
