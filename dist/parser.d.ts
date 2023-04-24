import * as glob from 'glob';
import { IGettextExtractorStats } from './extractor';
import { CatalogBuilder, IMessage } from './builder';
export interface IMessageData {
    text: string;
    textPlural?: string;
    context?: string;
    lineNumber?: number;
    fileName?: string;
    comments?: string[];
}
export declare type IAddMessageCallback = (data: IMessageData) => void;
export interface IParseOptions {
    lineNumberStart?: number;
    transformSource?: (source: string) => string;
}
export declare abstract class Parser<TExtractorFunction extends Function, TParseOptions extends IParseOptions> {
    protected builder: CatalogBuilder;
    protected extractors: TExtractorFunction[];
    protected stats?: IGettextExtractorStats | undefined;
    static STRING_LITERAL_FILENAME: string;
    static createAddMessageCallback(messages: Partial<IMessage>[], fileName: string, getLineNumber: () => number | undefined): IAddMessageCallback;
    constructor(builder: CatalogBuilder, extractors?: TExtractorFunction[], stats?: IGettextExtractorStats | undefined);
    parseString(source: string, fileName?: string, options?: TParseOptions): this;
    parseFile(fileName: string, options?: TParseOptions): this;
    parseFilesGlob(pattern: string, globOptions?: glob.IOptions, options?: TParseOptions): this;
    addExtractor(extractor: TExtractorFunction): this;
    protected validateParseOptions(options?: TParseOptions): void;
    protected validateExtractors(...extractors: TExtractorFunction[]): void;
    protected abstract parse(source: string, fileName: string, options?: TParseOptions): IMessage[];
}
