import * as ts from 'typescript';
import { Parser, IParseOptions } from '../parser';
import { IMessage } from '../builder';

export type IRegexExtractorFunction = (file: string, filename: string, messages: Array<IMessage>) => void;

export class RegexParser extends Parser<IRegexExtractorFunction, IParseOptions> {

    protected parse(source: string, fileName: string): Array<IMessage> {
        return this.parseSourceFile(source, fileName);
    }

    protected parseSourceFile(file: string, fileName: string): Array<IMessage> {
        let messages: Array<IMessage> = [];

        for (let extractor of this.extractors) {
            extractor(file, fileName, messages);
        }

        return messages;
    }
}

exports.RegexParser = RegexParser;
