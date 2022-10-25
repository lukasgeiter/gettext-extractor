import { Validate } from '../../utils/validate';
import { IContentExtractorOptions } from '../../utils/content';

export interface IAttributeMapping {
    textPlural?: string;
    context?: string;
    comment?: string;
}

export interface IHtmlExtractorOptions extends IContentExtractorOptions {
    attributes?: IAttributeMapping;
}

export function validateOptions(options: IHtmlExtractorOptions): void {
    Validate.optional.stringProperty(options, 'options.attributes.textPlural');
    Validate.optional.stringProperty(options, 'options.attributes.context');
    Validate.optional.stringProperty(options, 'options.attributes.comment');
}

