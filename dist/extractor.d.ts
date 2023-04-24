import * as pofile from 'pofile';
import { IContext, IMessage } from './builder';
import { JsParser, IJsExtractorFunction } from './js/parser';
import { HtmlParser, IHtmlExtractorFunction } from './html/parser';
export interface IGettextExtractorStats {
    numberOfMessages: number;
    numberOfPluralMessages: number;
    numberOfMessageUsages: number;
    numberOfContexts: number;
    numberOfParsedFiles: number;
    numberOfParsedFilesWithMessages: number;
}
export declare class GettextExtractor {
    private stats;
    private builder;
    constructor();
    createJsParser(extractors?: IJsExtractorFunction[]): JsParser;
    createHtmlParser(extractors?: IHtmlExtractorFunction[]): HtmlParser;
    addMessage(message: IMessage): void;
    getMessages(): IMessage[];
    getContexts(): IContext[];
    getMessagesByContext(context: string): IMessage[];
    getPotString(headers?: Partial<pofile.IHeaders>): string;
    savePotFile(fileName: string, headers?: Partial<pofile.IHeaders>): void;
    savePotFileAsync(fileName: string, headers?: Partial<pofile.IHeaders>): Promise<any>;
    getStats(): IGettextExtractorStats;
    printStats(): void;
    private getPofileItems;
}
