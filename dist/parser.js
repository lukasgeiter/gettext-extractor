"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
const fs = require("fs");
const glob = require("glob");
const validate_1 = require("./utils/validate");
class Parser {
    constructor(builder, extractors = [], stats) {
        this.builder = builder;
        this.extractors = extractors;
        this.stats = stats;
        this.validateExtractors(...extractors);
    }
    static createAddMessageCallback(messages, fileName, getLineNumber) {
        return (data) => {
            let references;
            if (typeof data.lineNumber !== 'number') {
                data.lineNumber = getLineNumber();
            }
            data.fileName = data.fileName || fileName;
            if (data.fileName && data.lineNumber && data.fileName !== Parser.STRING_LITERAL_FILENAME) {
                references = [`${data.fileName}:${data.lineNumber}`];
            }
            let message = {
                text: data.text,
                textPlural: data.textPlural || undefined,
                context: data.context || undefined,
                references: references,
                comments: data.comments && data.comments.length ? data.comments : undefined
            };
            messages.push(message);
        };
    }
    parseString(source, fileName, options) {
        validate_1.Validate.required.string({ source });
        validate_1.Validate.optional.nonEmptyString({ fileName });
        this.validateParseOptions(options);
        if (!this.extractors.length) {
            throw new Error(`Missing extractor functions. Provide them when creating the parser or dynamically add extractors using 'addExtractor()'`);
        }
        if (options && options.transformSource) {
            source = options.transformSource(source);
        }
        let messages = this.parse(source, fileName || Parser.STRING_LITERAL_FILENAME, options);
        for (let message of messages) {
            this.builder.addMessage(message);
        }
        this.stats && this.stats.numberOfParsedFiles++;
        if (messages.length) {
            this.stats && this.stats.numberOfParsedFilesWithMessages++;
        }
        return this;
    }
    parseFile(fileName, options) {
        validate_1.Validate.required.nonEmptyString({ fileName });
        this.validateParseOptions(options);
        this.parseString(fs.readFileSync(fileName).toString(), fileName, options);
        return this;
    }
    parseFilesGlob(pattern, globOptions, options) {
        validate_1.Validate.required.nonEmptyString({ pattern });
        validate_1.Validate.optional.object({ globOptions });
        this.validateParseOptions(options);
        for (let fileName of glob.sync(pattern, globOptions)) {
            this.parseFile(fileName, options);
        }
        return this;
    }
    addExtractor(extractor) {
        validate_1.Validate.required.argument({ extractor });
        this.validateExtractors(extractor);
        this.extractors.push(extractor);
        return this;
    }
    validateParseOptions(options) {
        validate_1.Validate.optional.numberProperty(options, 'options.lineNumberStart');
        validate_1.Validate.optional.functionProperty(options, 'options.transformSource');
    }
    validateExtractors(...extractors) {
        for (let extractor of extractors) {
            if (typeof extractor !== 'function') {
                throw new TypeError(`Invalid extractor function provided. '${extractor}' is not a function`);
            }
        }
    }
}
exports.Parser = Parser;
Parser.STRING_LITERAL_FILENAME = 'gettext-extractor-string-literal';
