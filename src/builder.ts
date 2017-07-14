import { IGettextExtractorStats } from './extractor';

export interface IMessage {
    text: string;
    textPlural?: string;
    context?: string;
    references?: string[];
    comments?: string[];
}

export interface IContext {
    name: string;
    messages: IMessage[];
}

export type IMessageMap = {[text: string]: IMessage};
export type IContextMap = {[context: string]: IMessageMap};

export class CatalogBuilder {

    private contexts: IContextMap = {};

    private static compareStrings(a: string, b: string): number {
        return a.localeCompare(b);
    }

    private static concatUnique(array: any[], items: any[]): any[] {
        array = array || [];
        for (let item of items || []) {
            if (array.indexOf(item) === -1) {
                array.push(item);
            }
        }
        return array;
    }

    private static extendMessage(message: IMessage, data: IMessage): IMessage {

        message.text = data.text || message.text;
        message.textPlural = data.textPlural || message.textPlural;
        message.context = typeof data.context === 'string' ? data.context : message.context;
        message.references = CatalogBuilder.concatUnique(message.references, data.references);
        message.comments = CatalogBuilder.concatUnique(message.comments, data.comments);

        return message;
    }

    private static normalizeMessage(message: IMessage): IMessage {
        return CatalogBuilder.extendMessage({
            text: null,
            textPlural: null,
            context: null,
            references: [],
            comments: []
        }, message);
    }

    constructor(
        private stats?: IGettextExtractorStats
    ) {}

    public addMessage(message: IMessage): void {
        message = CatalogBuilder.normalizeMessage(message);
        let context = this.getOrCreateContext(message.context || '');
        if (context[message.text]) {
            if (message.textPlural && context[message.text].textPlural && context[message.text].textPlural !== message.textPlural) {
                throw new Error(`Incompatible plurals found for '${message.text}' ('${context[message.text].textPlural}' and '${message.textPlural}')`);
            }

            if (message.textPlural && !context[message.text].textPlural) {
                this.stats && this.stats.numberOfPluralMessages++;
            }

            CatalogBuilder.extendMessage(context[message.text], message);
        } else {
            context[message.text] = message;

            this.stats && this.stats.numberOfMessages++;
            if (message.textPlural) {
                this.stats && this.stats.numberOfPluralMessages++;
            }
        }

        this.stats && this.stats.numberOfMessageUsages++;
    }

    public getMessages(): IMessage[] {
        let messages: IMessage[] = [];
        for (let context of Object.keys(this.contexts).sort(CatalogBuilder.compareStrings)) {
            messages = messages.concat(this.getMessagesByContext(context));
        }
        return messages;
    }

    public getContexts(): IContext[] {
        let contexts: IContext[] = [];
        for (let context of Object.keys(this.contexts).sort(CatalogBuilder.compareStrings)) {
            contexts.push({
                name: context,
                messages: this.getMessagesByContext(context)
            });
        }
        return contexts;
    }

    public getMessagesByContext(context: string): IMessage[] {
        let messages = this.contexts[context];
        if (!messages) {
            return [];
        }
        return Object.keys(messages).sort(CatalogBuilder.compareStrings).map(text => messages[text]);
    }

    private getOrCreateContext(context: string): IMessageMap {
        if (!this.contexts[context]) {
            this.contexts[context] = {};
            this.stats && this.stats.numberOfContexts++;
        }
        return this.contexts[context];
    }
}
