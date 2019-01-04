import { Validate } from './validate';

export interface IContentOptions {
    trimWhiteSpace: boolean;
    preserveIndentation: boolean;
    replaceNewLines: false | string;
}

export interface IContentExtractorOptions {
    content?: Partial<IContentOptions>;
}

export function validateContentOptions(options: IContentExtractorOptions): void {
    Validate.optional.booleanProperty(options, 'options.content.trimWhiteSpace');
    Validate.optional.booleanProperty(options, 'options.content.preserveIndentation');
    if (options.content && options.content.replaceNewLines !== undefined
        && options.content.replaceNewLines !== false && typeof options.content.replaceNewLines !== 'string') {
        throw new TypeError(`Property 'options.content.replaceNewLines' must be false or a string`);
    }
}

export function normalizeContent(content: string, options: IContentOptions): string {
    content = content.replace(/\r\n/g, '\n');
    if (options.trimWhiteSpace) {
        content = content.replace(/^\n+|\s+$/g, '');
    }
    if (!options.preserveIndentation) {
        content = content.replace(/^[ \t]+/mg, '');
    }
    if (typeof options.replaceNewLines === 'string') {
        content = content.replace(/\n/g, options.replaceNewLines);
    }

    return content;
}
