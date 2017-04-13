import * as fs from 'fs';
import * as glob from 'glob';

import { GettextExtractor, IGettextExtractorStats } from './extractor';
import { CatalogBuilder } from './builder';
import { Validate } from './utils/validate';

export interface IMessageData {
    text: string;
    textPlural?: string;
    context?: string;
    lineNumber?: number;
    fileName?: string;
    comments?: string[];
}

export type IAddMessageCallback = (data: IMessageData) => void;

export abstract class Parser<TExtractorFunction extends Function> {

    public static STRING_LITERAL_FILENAME: string = 'gettext-extractor-string-literal';

    constructor(
        protected builder: CatalogBuilder,
        protected extractors: TExtractorFunction[] = [],
        protected stats?: IGettextExtractorStats
    ) {
        this.validateExtractors(...extractors);
    }

    public parseString(source: string, fileName?: string): this {
        Validate.required.string({source});
        Validate.optional.string({fileName});

        if (!this.extractors.length) {
            throw new Error(`Missing extractor functions. Provide them when creating the parser or dynamically add extractors using 'addExtractor()'`);
        }

        this.parse(source, fileName || Parser.STRING_LITERAL_FILENAME);

        return this;
    }

    public parseFile(fileName: string): this {
        Validate.required.nonEmptyString({fileName});

        this.parseString(fs.readFileSync(fileName).toString(), fileName);

        return this;
    }

    public parseFilesGlob(pattern: string): this {
        Validate.required.nonEmptyString({pattern});

        for (let fileName of glob.sync(pattern)) {
            this.parseFile(fileName);
        }

        return this;
    }

    public addExtractor(extractor: TExtractorFunction): this {
        Validate.required.argument({extractor});
        this.validateExtractors(extractor);

        this.extractors.push(extractor);

        return this;
    }

    protected validateExtractors(...extractors: TExtractorFunction[]): void {
        for (let extractor of extractors) {
            if (typeof extractor !== 'function') {
                throw new TypeError(`Invalid extractor function provided. '${extractor}' is not a function`);
            }
        }
    }

    protected abstract parse(source: string, fileName: string): void;
}
