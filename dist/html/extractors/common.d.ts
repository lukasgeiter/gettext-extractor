import { IContentExtractorOptions } from '../../utils/content';
export interface IAttributeMapping {
    textPlural?: string;
    context?: string;
    comment?: string;
}
export interface IHtmlExtractorOptions extends IContentExtractorOptions {
    attributes?: IAttributeMapping;
}
export declare function validateOptions(options: IHtmlExtractorOptions): void;
