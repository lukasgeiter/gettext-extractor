"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GettextExtractor = void 0;
const fs = require("fs");
const pofile = require("pofile");
const builder_1 = require("./builder");
const parser_1 = require("./js/parser");
const parser_2 = require("./html/parser");
const output_1 = require("./utils/output");
const validate_1 = require("./utils/validate");
class GettextExtractor {
    constructor() {
        this.stats = {
            numberOfMessages: 0,
            numberOfPluralMessages: 0,
            numberOfMessageUsages: 0,
            numberOfContexts: 0,
            numberOfParsedFiles: 0,
            numberOfParsedFilesWithMessages: 0
        };
        this.builder = new builder_1.CatalogBuilder(this.stats);
    }
    createJsParser(extractors) {
        validate_1.Validate.optional.nonEmptyArray({ extractors });
        return new parser_1.JsParser(this.builder, extractors, this.stats);
    }
    createHtmlParser(extractors) {
        validate_1.Validate.optional.nonEmptyArray({ extractors });
        return new parser_2.HtmlParser(this.builder, extractors, this.stats);
    }
    addMessage(message) {
        validate_1.Validate.required.stringProperty(message, 'message.text');
        validate_1.Validate.optional.stringProperty(message, 'message.textPlural');
        validate_1.Validate.optional.stringProperty(message, 'message.context');
        validate_1.Validate.optional.arrayProperty(message, 'message.references');
        validate_1.Validate.optional.arrayProperty(message, 'message.comments');
        this.builder.addMessage(message);
    }
    getMessages() {
        return this.builder.getMessages();
    }
    getContexts() {
        return this.builder.getContexts();
    }
    getMessagesByContext(context) {
        return this.builder.getMessagesByContext(context);
    }
    getPotString(headers = {}) {
        validate_1.Validate.optional.object({ headers });
        let po = new pofile();
        po.items = this.getPofileItems();
        po.headers = Object.assign({ 'Content-Type': 'text/plain; charset=UTF-8' }, headers);
        return po.toString();
    }
    savePotFile(fileName, headers) {
        validate_1.Validate.required.nonEmptyString({ fileName });
        validate_1.Validate.optional.object({ headers });
        fs.writeFileSync(fileName, this.getPotString(headers));
    }
    savePotFileAsync(fileName, headers) {
        validate_1.Validate.required.nonEmptyString({ fileName });
        validate_1.Validate.optional.object({ headers });
        return new Promise((resolve, reject) => {
            fs.writeFile(fileName, this.getPotString(headers), (error) => {
                if (error) {
                    return reject(error);
                }
                resolve();
            });
        });
    }
    getStats() {
        return this.stats;
    }
    printStats() {
        new output_1.StatsOutput(this.getStats()).print();
    }
    getPofileItems() {
        return this.getMessages().map(message => {
            let item = new pofile.Item();
            item.msgid = message.text;
            item.msgid_plural = message.textPlural;
            item.msgctxt = message.context;
            item.references = message.references.sort((a, b) => a.localeCompare(b));
            item.extractedComments = message.comments;
            return item;
        });
    }
}
exports.GettextExtractor = GettextExtractor;
