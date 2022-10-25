import { Validate } from './validate';

export interface IContentOptions {
    trimWhiteSpace: boolean;
    preserveIndentation: boolean;
    replaceNewLines: false | string;
}

export interface IContentExtractorOptions {
    content?: Partial<IContentOptions>;
}

export function getContentOptions(extractorOptions: IContentExtractorOptions, defaultOptions: IContentOptions): IContentOptions {
    let contentOptions = defaultOptions;

    if (extractorOptions.content) {
        if (extractorOptions.content.trimWhiteSpace !== undefined) {
            contentOptions.trimWhiteSpace = extractorOptions.content.trimWhiteSpace;
        }
        if (extractorOptions.content.preserveIndentation !== undefined) {
            contentOptions.preserveIndentation = extractorOptions.content.preserveIndentation;
        }
        if (extractorOptions.content.replaceNewLines !== undefined) {
            contentOptions.replaceNewLines = extractorOptions.content.replaceNewLines;
        }
    }

    return contentOptions;
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
        if (options.preserveIndentation) {
            // trim whitespace while preserving indentation
            // uses regex constructor instead of literal to simplify documentation
            let contentWithIndentationRegex = new RegExp(
                '^\\s*?' + // non-greedily matches whitespace in the beginning
                '(' +
                    '[ \\t]*\\S' + // matches tabs or spaces in front of a non-whitespace character
                    '[^]*?' + // non-greedily matches everything (including newlines) until the end (minus trailing whitespace)
                ')' +
                '\\s*$', // matches trailing whitespace
                'g'
            );
            content = content.replace(contentWithIndentationRegex, '$1');
        } else {
            content = content.trim();
        }
    }
    if (!options.preserveIndentation) {
        content = content.replace(/^[ \t]+/mg, '');
    }
    if (typeof options.replaceNewLines === 'string') {
        content = content.replace(/\n/g, options.replaceNewLines);
    }

    return content;
}
