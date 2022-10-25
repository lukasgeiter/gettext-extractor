import { IHtmlExtractorFunction } from '../../parser';
import { HtmlUtils } from '../../utils';
import { elementExtractor } from './element';
import { Validate } from '../../../utils/validate';
import { IHtmlExtractorOptions, validateOptions } from '../common';
import { IContentOptions, getContentOptions, validateContentOptions } from '../../../utils/content';

export function elementAttributeExtractor(selector: string, textAttribute: string, options: IHtmlExtractorOptions = {}): IHtmlExtractorFunction {
    Validate.required.nonEmptyString({selector, textAttribute});
    validateOptions(options);
    validateContentOptions(options);

    let contentOptions: IContentOptions = getContentOptions(options, {
        trimWhiteSpace: false,
        preserveIndentation: true,
        replaceNewLines: false
    });

    return elementExtractor(selector, element => {
        return HtmlUtils.getNormalizedAttributeValue(element, textAttribute, contentOptions);
    }, options);
}
