export interface IContentOptions {
    trimWhiteSpace: boolean;
    preserveIndentation: boolean;
    replaceNewLines: false | string;
}
export interface IContentExtractorOptions {
    content?: Partial<IContentOptions>;
}
export declare function getContentOptions(extractorOptions: IContentExtractorOptions, defaultOptions: IContentOptions): IContentOptions;
export declare function validateContentOptions(options: IContentExtractorOptions): void;
export declare function normalizeContent(content: string, options: IContentOptions): string;
