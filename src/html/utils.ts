import * as parse5 from 'parse5';

import { Element } from './parser';

export interface IElementContentOptions {
    trimWhiteSpace: boolean;
    preserveIndentation: boolean;
    replaceNewLines: false | string;
}

export abstract class HtmlUtils {

    public static getAttributeValue(element: Element, attributeName: string): string {
        for (let attribute of element.attrs) {
            if (attribute.name === attributeName) {
                return attribute.value;
            }
        }
        return null;
    }

    public static getElementContent(element: Element, options: IElementContentOptions): string {
        let content = parse5.serialize(element, {});

        if (options.trimWhiteSpace) {
            content = content.replace(/^\n+|\s+$/g, '');
        }
        if (!options.preserveIndentation) {
            content = content.replace(/^[ \t]+/mg, '');
        }
        if (typeof options.replaceNewLines === 'string') {
            content = content.replace(/\n/g, options.replaceNewLines);
        }

        return content;
    }
}
