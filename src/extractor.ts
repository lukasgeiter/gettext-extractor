import * as fs from 'fs';
import * as pofile from 'pofile';

import { CatalogBuilder, IContext, IMessage } from './builder';
import { JsParser, IJsExtractorFunction } from './js/parser';
import { HtmlParser, IHtmlExtractorFunction } from './html/parser';
import { StatsOutput } from './utils/output';
import { Validate } from './utils/validate';

export interface IGettextExtractorStats {
    numberOfMessages: number;
    numberOfPluralMessages: number;
    numberOfMessageUsages: number;
    numberOfContexts: number;
    numberOfParsedFiles: number;
    numberOfParsedFilesWithMessages: number;
}

export class GettextExtractor {

    private stats: IGettextExtractorStats = {
        numberOfMessages: 0,
        numberOfPluralMessages: 0,
        numberOfMessageUsages: 0,
        numberOfContexts: 0,
        numberOfParsedFiles: 0,
        numberOfParsedFilesWithMessages: 0
    };

    private builder: CatalogBuilder;

    constructor() {
        this.builder = new CatalogBuilder(this.stats);
    }

    public createJsParser(extractors?: IJsExtractorFunction[]): JsParser {
        Validate.optional.nonEmptyArray({extractors});

        return new JsParser(this.builder, extractors, this.stats);
    }

    public createHtmlParser(extractors?: IHtmlExtractorFunction[]): HtmlParser {
        Validate.optional.nonEmptyArray({extractors});

        return new HtmlParser(this.builder, extractors, this.stats);
    }

    public addMessage(message: IMessage): void {
        Validate.required.stringProperty(message, 'message.text');
        Validate.optional.stringProperty(message, 'message.textPlural');
        Validate.optional.stringProperty(message, 'message.context');
        Validate.optional.arrayProperty(message, 'message.references');
        Validate.optional.arrayProperty(message, 'message.comments');

        this.builder.addMessage(message);
    }

    public getMessages(): IMessage[] {
        return this.builder.getMessages();
    }

    public getContexts(): IContext[] {
        return this.builder.getContexts();
    }

    public getMessagesByContext(context: string): IMessage[] {
        return this.builder.getMessagesByContext(context);
    }

    public getPotString(headers: Partial<pofile.IHeaders> = {}): string {
        Validate.optional.object({headers});

        let po = new (<any>pofile)();
        po.items = this.getPofileItems();
        po.headers = headers;
        po.headers['Content-Type'] = po.headers['Content-Type'] || 'text/plain; charset=UTF-8';
        return po.toString();
    }

    public savePotFile(fileName: string, headers?: Partial<pofile.IHeaders>): void {
        Validate.required.nonEmptyString({fileName});
        Validate.optional.object({headers});

        fs.writeFileSync(fileName, this.getPotString(headers));
    }

    public savePotFileAsync(fileName: string, headers?: Partial<pofile.IHeaders>): Promise<any> {
        Validate.required.nonEmptyString({fileName});
        Validate.optional.object({headers});

        return new Promise((resolve, reject) => {
            fs.writeFile(fileName, this.getPotString(headers), (error) => {
                if (error) {
                    return reject(error);
                }
                resolve();
            });
        });
    }

    public getStats(): IGettextExtractorStats {
        return this.stats;
    }

    public printStats(): void {
        new StatsOutput(this.getStats()).print();
    }

    private getPofileItems(): pofile.Item[] {
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
