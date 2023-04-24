import { Element } from './parser';
import { IContentOptions } from '../utils/content';
export declare abstract class HtmlUtils {
    static getAttributeValue(element: Element, attributeName: string): string | null;
    static getNormalizedAttributeValue(element: Element, attributeName: string, options: IContentOptions): string | null;
    static getElementContent(element: Element, options: IContentOptions): string;
}
