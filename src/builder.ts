import { IGettextExtractorStats } from './extractor';

export interface IGettextMessage {
    msgid: string;
    msgid_plural?: string;
    msgctxt?: string;
    comments?: {
        reference?: string;
        extracted?: string;
    };
}

export type IGettextMessageMap = {[text: string]: IGettextMessage};
export type IGettextContextMap = {[context: string]: IGettextMessageMap};

export interface IMessage {
    text: string;
    textPlural?: string;
    context?: string;
    references?: string[];
    comments?: string[];
}

export type IMessageMap = {[text: string]: IMessage};
export type IContextMap = {[context: string]: IMessageMap};

export class CatalogBuilder {

    private static readonly DEFAULT_CONTEXT: string = '';

    private contexts: IContextMap = {};

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
            context: CatalogBuilder.DEFAULT_CONTEXT,
            references: [],
            comments: []
        }, message);
    }

    private static convertMessageToGettext(message: IMessage): IGettextMessage {
        let gettext: IGettextMessage = {
            msgid: message.text
        };

        if (message.textPlural) {
            gettext.msgid_plural = message.textPlural;
        }

        if (message.context !== CatalogBuilder.DEFAULT_CONTEXT) {
            gettext.msgctxt = message.context;
        }

        if (message.references.length || message.comments.length) {
            gettext.comments = {};

            if (message.references.length) {
                gettext.comments.reference = message.references.join('\n');
            }
            if (message.comments.length) {
                gettext.comments.extracted = message.comments.join('\n');
            }
        }

        return gettext;
    }

    constructor(
        private stats?: IGettextExtractorStats
    ) {}

    public addMessage(message: IMessage): void {
        message = CatalogBuilder.normalizeMessage(message);
        let context = this.getOrCreateContext(message.context);
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

    public toGettextMessages(): IGettextContextMap {
        function compareStrings(a: string, b: string): number {
            return a.localeCompare(b);
        }

        let gettext: IGettextContextMap = {};
        for (let contextName of Object.keys(this.contexts).sort(compareStrings)) {
            gettext[contextName] = {};
            for (let text of Object.keys(this.contexts[contextName]).sort(compareStrings)) {
                gettext[contextName][text] = CatalogBuilder.convertMessageToGettext(this.contexts[contextName][text]);
            }
        }
        return gettext;
    }

    private getOrCreateContext(context: string): IMessageMap {
        if (!this.contexts[context]) {
            this.contexts[context] = {};
            this.stats && this.stats.numberOfContexts++;
        }
        return this.contexts[context];
    }
}
