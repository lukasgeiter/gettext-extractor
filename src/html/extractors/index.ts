import { elementAttributeExtractor } from './factories/elementAttribute';
import { elementContentExtractor } from './factories/elementContent';
import { embeddedAttributeJsExtractor } from './factories/embeddedAttributeJs';
import { embeddedJsExtractor } from './factories/embeddedJs';

export abstract class HtmlExtractors {
    public static elementContent: typeof elementContentExtractor = elementContentExtractor;
    public static elementAttribute: typeof elementAttributeExtractor = elementAttributeExtractor;
    public static embeddedJs: typeof embeddedJsExtractor = embeddedJsExtractor;
    public static embeddedAttributeJs: typeof embeddedAttributeJsExtractor = embeddedAttributeJsExtractor;
}
