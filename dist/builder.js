"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatalogBuilder = void 0;
class CatalogBuilder {
    constructor(stats) {
        this.stats = stats;
        this.contexts = {};
    }
    static compareStrings(a, b) {
        return a.localeCompare(b);
    }
    static concatUnique(array, items) {
        array = array || [];
        for (let item of items || []) {
            if (array.indexOf(item) === -1) {
                array.push(item);
            }
        }
        return array;
    }
    static extendMessage(message, data) {
        message.text = typeof data.text === 'string' ? data.text : message.text;
        message.textPlural = typeof data.textPlural === 'string' ? data.textPlural : message.textPlural;
        message.context = typeof data.context === 'string' ? data.context : message.context;
        message.references = CatalogBuilder.concatUnique(message.references, data.references);
        message.comments = CatalogBuilder.concatUnique(message.comments, data.comments);
        return message;
    }
    static normalizeMessage(message) {
        return CatalogBuilder.extendMessage({
            text: null,
            textPlural: null,
            context: null,
            references: [],
            comments: []
        }, message);
    }
    addMessage(message) {
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
        }
        else {
            context[message.text] = message;
            this.stats && this.stats.numberOfMessages++;
            if (message.textPlural) {
                this.stats && this.stats.numberOfPluralMessages++;
            }
        }
        this.stats && this.stats.numberOfMessageUsages++;
    }
    getMessages() {
        let messages = [];
        for (let context of Object.keys(this.contexts).sort(CatalogBuilder.compareStrings)) {
            messages = messages.concat(this.getMessagesByContext(context));
        }
        return messages;
    }
    getContexts() {
        let contexts = [];
        for (let context of Object.keys(this.contexts).sort(CatalogBuilder.compareStrings)) {
            contexts.push({
                name: context,
                messages: this.getMessagesByContext(context)
            });
        }
        return contexts;
    }
    getMessagesByContext(context) {
        let messages = this.contexts[context];
        if (!messages) {
            return [];
        }
        return Object.keys(messages).sort(CatalogBuilder.compareStrings).map(text => messages[text]);
    }
    getOrCreateContext(context) {
        if (!this.contexts[context]) {
            this.contexts[context] = {};
            this.stats && this.stats.numberOfContexts++;
        }
        return this.contexts[context];
    }
}
exports.CatalogBuilder = CatalogBuilder;
