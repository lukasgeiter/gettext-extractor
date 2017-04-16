import { IHtmlExtractorFunction } from '../../parser';
import { HtmlUtils } from '../../utils';
import { elementExtractor } from './element';
import { Validate } from '../../../utils/validate';
import { IHtmlExtractorOptions, validateOptions } from '../common';

export function elementAttributeExtractor(selector: string, textAttribute: string, options: IHtmlExtractorOptions = {}): IHtmlExtractorFunction {
    Validate.required.nonEmptyString({selector, textAttribute});
    validateOptions(options);

    return elementExtractor(selector, element => {
        return HtmlUtils.getAttributeValue(element, textAttribute);
    }, options);
}
