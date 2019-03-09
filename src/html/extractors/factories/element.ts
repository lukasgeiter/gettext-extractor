import { IHtmlExtractorFunction } from '../../parser';
import { IAddMessageCallback } from '../../../parser';
import { IElementSelector, ElementSelectorSet } from '../../selector';
import { Element, Node } from '../../parser';
import { HtmlUtils } from '../../utils';
import { IHtmlExtractorOptions } from '../common';

export type ITextExtractor = (element: Element) => string | null;

export function elementExtractor(selector: string | IElementSelector[], textExtractor: ITextExtractor, options: IHtmlExtractorOptions = {}): IHtmlExtractorFunction {

    let selectors = new ElementSelectorSet(selector);

    return (node: Node, fileName: string, addMessage: IAddMessageCallback) => {
        if (typeof (<Element>node).tagName !== 'string') {
            return;
        }

        let element = <Element>node;

        if (selectors.anyMatch(element)) {
            let context: string | undefined,
                textPlural: string | undefined;

            if (options.attributes && options.attributes.context) {
                context = HtmlUtils.getAttributeValue(element, options.attributes.context) || undefined;
            }

            if (options.attributes && options.attributes.textPlural) {
                textPlural = HtmlUtils.getAttributeValue(element, options.attributes.textPlural) || undefined;
            }

            let text = textExtractor(element);

            if (typeof text === 'string') {
                addMessage({text, context, textPlural});
            }
        }
    };
}
