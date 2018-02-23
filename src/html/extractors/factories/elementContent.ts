import { IHtmlExtractorFunction } from '../../parser';
import { HtmlUtils } from '../../utils';
import { Validate } from '../../../utils/validate';
import { IContentOptions, IContentExtractorOptions, validateContentOptions } from '../../../utils/content';
import { IHtmlExtractorOptions, validateOptions } from '../common';
import { elementExtractor } from './element';

export interface IElementContentExtractorOptions extends IHtmlExtractorOptions, IContentExtractorOptions {}

export function elementContentExtractor(selector: string, options: IElementContentExtractorOptions = {}): IHtmlExtractorFunction {
    Validate.required.nonEmptyString({selector});
    validateOptions(options);
    validateContentOptions(options);

    let contentOptions: IContentOptions = {
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
