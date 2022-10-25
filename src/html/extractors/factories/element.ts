import { IHtmlExtractorFunction } from '../../parser';
import { IAddMessageCallback } from '../../../parser';
import { IElementSelector, ElementSelectorSet } from '../../selector';
import { Element, Node } from '../../parser';
import { HtmlUtils } from '../../utils';
import { IHtmlExtractorOptions } from '../common';
import { getContentOptions, IContentOptions } from '../../../utils/content';

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
                textPlural: string | undefined,
                comments: string[] = [],
                contentOptions: IContentOptions = getContentOptions(options, {
                    trimWhiteSpace: true,
                    preserveIndentation: false,
                    replaceNewLines: false
                });

            if (options.attributes && options.attributes.context) {
                context = HtmlUtils.getNormalizedAttributeValue(element, options.attributes.context, contentOptions) || undefined;
            }

            if (options.attributes && options.attributes.textPlural) {
                textPlural = HtmlUtils.getNormalizedAttributeValue(element, options.attributes.textPlural, contentOptions) || undefined;
            }

            if (options.attributes && options.attributes.comment) {
                let comment = HtmlUtils.getNormalizedAttributeValue(element, options.attributes.comment, contentOptions);
                if (comment) {
                    comments.push(comment);
                }
            }

            let text = textExtractor(element);

            if (typeof text === 'string') {
                addMessage({text, context, textPlural, comments});
            }
        }
    };
}
