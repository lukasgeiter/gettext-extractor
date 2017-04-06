import * as fs from 'fs';
import * as gettextParser from 'gettext-parser';

import { CatalogBuilder, IGettextContextMap, IMessage } from './builder';
import { JsParser, IJsExtractorFunction } from './js/parser';
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

    public static STRING_LITERAL_FILENAME: string = 'gettext-extractor-string-literal';

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

    public addMessage(message: IMessage): void {
        Validate.required.stringProperty(message, 'message.text');
        Validate.optional.stringProperty(message, 'message.textPlural');
        Validate.optional.stringProperty(message, 'message.context');
        Validate.optional.arrayProperty(message, 'message.references');
        Validate.optional.arrayProperty(message, 'message.comments');

        this.builder.addMessage(message);
    }

    public toGettextMessages(): IGettextContextMap {
        return this.builder.toGettextMessages();
    }

    public toPotString(): string {
        return gettextParser.po.compile({translations: this.toGettextMessages(), charset: 'UTF-8'}).toString();
    }

    public savePotFile(fileName: string): void {
        Validate.required.nonEmptyString({fileName});

        fs.writeFileSync(fileName, this.toPotString());
    }

    public getStats(): IGettextExtractorStats {
        return this.stats;
    }

    public printStats(): void {
        new StatsOutput(this.getStats()).print();
    }
}
