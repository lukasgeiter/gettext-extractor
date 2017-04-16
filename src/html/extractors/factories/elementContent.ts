import { IHtmlExtractorFunction, Element, Node } from '../../parser';
import { IAddMessageCallback } from '../../../parser';
import { IElementContentOptions, HtmlUtils } from '../../utils';
import { ElementSelectorSet, IElementSelector } from '../../selector';
import { Validate } from '../../../utils/validate';

export interface IAttributeMapping {
    textPlural?: string;
    context?: string;
    comment?: string;
}

export interface IHtmlExtractorOptions {
    attributes?: IAttributeMapping;
    content?: Partial<IElementContentOptions>;
}

export function validateOptions(options: IHtmlExtractorOptions): void {
    Validate.optional.stringProperty(options, 'options.attributes.textPlural');
    Validate.optional.stringProperty(options, 'options.attributes.context');
    Validate.optional.stringProperty(options, 'options.attributes.comment');
}

export function elementContentExtractor(selector: string, options: IHtmlExtractorOptions = {}): IHtmlExtractorFunction {
    Validate.required.nonEmptyString({selector});
    validateOptions(options);
    Validate.optional.booleanProperty(options, 'options.content.trimWhiteSpace');
    Validate.optional.booleanProperty(options, 'options.content.preserveIndentation');
    if (options.content && options.content.replaceNewLines !== undefined
        && options.content.replaceNewLines !== false && typeof options.content.replaceNewLines !== 'string') {
        throw new TypeError(`Property 'options.content.replaceNewLines' must be false or a string`);
    }

    let selectors = new ElementSelectorSet(selector);

    let contentOptions: IElementContentOptions = {
        trimWhiteSpace: true,
        preserveIndentation: false,
        replaceNewLines: false
    };

    if (options.content) {
        if (options.content.trimWhiteSpace !== undefined) {
            contentOptions.trimWhiteSpace = options.content.trimWhiteSpace;
        }
        if (options.content.preserveIndentation !== undefined) {
            contentOptions.preserveIndentation = options.content.preserveIndentation;
        }
        if (options.content.replaceNewLines !== undefined) {
            contentOptions.replaceNewLines = options.content.replaceNewLines;
        }
    }

    return (node: Node, fileName: string, addMessage: IAddMessageCallback) => {
        if (typeof (<Element>node).tagName !== 'string') {
            return;
        }

        let element = <Element>node;

        if (selectors.anyMatch(element)) {
            let context: string,
                textPlural: string;

            if (options.attributes && options.attributes.context) {
                context = HtmlUtils.getAttributeValue(element, options.attributes.context) || undefined;
            }

            if (options.attributes && options.attributes.textPlural) {
                textPlural = HtmlUtils.getAttributeValue(element, options.attributes.textPlural) || undefined;
            }

            let text = HtmlUtils.getElementContent(element, contentOptions);

            addMessage({text, context, textPlural});
        }
    };
}
