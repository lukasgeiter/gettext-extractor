import { IHtmlExtractorFunction } from '../../parser';
import { HtmlUtils } from '../../utils';
import { Validate } from '../../../utils/validate';
import { getContentOptions, IContentOptions, validateContentOptions } from '../../../utils/content';
import { IHtmlExtractorOptions, validateOptions } from '../common';
import { elementExtractor } from './element';

export function elementContentExtractor(selector: string, options: IHtmlExtractorOptions = {}): IHtmlExtractorFunction {
    Validate.required.nonEmptyString({selector});
    validateOptions(options);
    validateContentOptions(options);

    let contentOptions: IContentOptions = getContentOptions(options, {
        trimWhiteSpace: true,
        preserveIndentation: false,
        replaceNewLines: false
    });

    return elementExtractor(selector, element => {
        return HtmlUtils.getElementContent(element, contentOptions);
    }, options);
}
