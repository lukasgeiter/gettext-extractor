import { elementContentExtractor } from './factories/elementContent';
import { elementAttributeExtractor } from './factories/elementAttribute';

export abstract class HtmlExtractors {
    public static elementContent: typeof elementContentExtractor = elementContentExtractor;
    public static elementAttribute: typeof elementAttributeExtractor = elementAttributeExtractor;
}
