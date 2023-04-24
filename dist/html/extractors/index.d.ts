import { elementAttributeExtractor } from './factories/elementAttribute';
import { elementContentExtractor } from './factories/elementContent';
import { embeddedAttributeJsExtractor } from './factories/embeddedAttributeJs';
import { embeddedJsExtractor } from './factories/embeddedJs';
export declare abstract class HtmlExtractors {
    static elementContent: typeof elementContentExtractor;
    static elementAttribute: typeof elementAttributeExtractor;
    static embeddedJs: typeof embeddedJsExtractor;
    static embeddedAttributeJs: typeof embeddedAttributeJsExtractor;
}
