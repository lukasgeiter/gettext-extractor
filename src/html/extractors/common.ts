import { Validate } from '../../utils/validate';

export interface IAttributeMapping {
    textPlural?: string;
    context?: string;
    comment?: string;
}

export interface IHtmlExtractorOptions {
    attributes?: IAttributeMapping;
    rawHtml?: boolean;
}

export function validateOptions(options: IHtmlExtractorOptions): void {
    Validate.optional.stringProperty(options, 'options.attributes.textPlural');
    Validate.optional.stringProperty(options, 'options.attributes.context');
    Validate.optional.stringProperty(options, 'options.attributes.comment');
    Validate.optional.booleanProperty(options, 'options.rawHtml');
}

