import * as parse5 from 'parse5';

import { Element } from './parser';
import { IContentOptions, normalizeContent } from '../utils/content';

export abstract class HtmlUtils {

    public static getAttributeValue(element: Element, attributeName: string): string | null {
        for (let attribute of element.attrs) {
            if (attribute.name === attributeName) {
                return attribute.value;
            }
        }
        return null;
    }

    public static getElementContent(element: Element, options: IContentOptions): string {
        let content = parse5.serialize(element, {});
        
        // Un-escape characters that get escaped by parse5
        content = content
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>');

        return normalizeContent(content, options);
    }

    public static getElementContentSource(element: Element, source: string, options: IContentOptions): string {
        const first = (element.childNodes[0] as Element).sourceCodeLocation
        const last = (element.childNodes[element.childNodes.length - 1] as Element).sourceCodeLocation;
        if (!(first && last))
            throw new Error('source location info required');
        const content = source.slice(first.startOffset, last.endOffset);
        return normalizeContent(content, options);
    }
}
