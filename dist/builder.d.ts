import { IGettextExtractorStats } from './extractor';
export interface IMessage {
    text: string | null;
    textPlural?: string | null;
    context?: string | null;
    references: string[];
    comments: string[];
}
export interface IContext {
    name: string;
    messages: IMessage[];
}
export declare type IMessageMap = {
    [text: string]: IMessage;
};
export declare type IContextMap = {
    [context: string]: IMessageMap;
};
export declare class CatalogBuilder {
    private stats?;
    private contexts;
    private static compareStrings;
    private static concatUnique;
    private static extendMessage;
    private static normalizeMessage;
    constructor(stats?: IGettextExtractorStats | undefined);
    addMessage(message: Partial<IMessage>): void;
    getMessages(): IMessage[];
    getContexts(): IContext[];
    getMessagesByContext(context: string): IMessage[];
    private getOrCreateContext;
}
