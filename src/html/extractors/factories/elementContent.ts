import { IHtmlExtractorFunction } from '../../parser';
import { IElementContentOptions, HtmlUtils } from '../../utils';
import { Validate } from '../../../utils/validate';
import { IHtmlExtractorOptions, validateOptions } from '../common';
import { elementExtractor } from './element';

export interface IElementContentExtractorOptions extends IHtmlExtractorOptions {
    content?: Partial<IElementContentOptions>;
}

export function elementContentExtractor(selector: string, options: IElementContentExtractorOptions = {}): IHtmlExtractorFunction {
    Validate.required.nonEmptyString({selector});
    validateOptions(options);
    Validate.optional.booleanProperty(options, 'options.content.trimWhiteSpace');
    Validate.optional.booleanProperty(options, 'options.content.preserveIndentation');
    if (options.content && options.content.replaceNewLines !== undefined
        && options.content.replaceNewLines !== false && typeof options.content.replaceNewLines !== 'string') {
        throw new TypeError(`Property 'options.content.replaceNewLines' must be false or a string`);
    }

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

    return elementExtractor(selector, element => {
        return HtmlUtils.getElementContent(element, contentOptions);
    }, options);
}
