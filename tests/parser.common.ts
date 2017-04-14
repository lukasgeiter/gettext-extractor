import { Parser, IAddMessageCallback } from '../src/parser';
import { CatalogBuilder, IMessage } from '../src/builder';
import { IGettextExtractorStats } from '../src/extractor';

export function registerCommonParserTests(parserClass: any): void {
    let parser: Parser<any>,
        builder: CatalogBuilder,
        messages: IMessage[];

    beforeEach(() => {
        messages = [];

        builder = <any>{
            stats: {},
            addMessage: jest.fn((message: IMessage) => {
                messages.push(message);
            })
        };
    });

    test('one extractor', () => {
        let extractor = jest.fn();
        parser = new parserClass(builder, [extractor]);
        parser.parseString('');
        expect(extractor).toHaveBeenCalled();
    });

    test('multiple extractors', () => {
        let extractor1 = jest.fn(),
            extractor2 = jest.fn();
        parser = new parserClass(builder, [extractor1, extractor2]);
        parser.parseString('');
        expect(extractor1).toHaveBeenCalled();
        expect(extractor2).toHaveBeenCalled();
    });

    test('extractor added later', () => {
        let extractor = jest.fn();
        parser = new parserClass(builder);
        parser.addExtractor(extractor);
        parser.parseString('');
        expect(extractor).toHaveBeenCalled();
    });

    test('second extractor added later', () => {
        let extractor1 = jest.fn(),
            extractor2 = jest.fn();
        parser = new parserClass(builder, [extractor1]);
        parser.parseString('');
        expect(extractor1).toHaveBeenCalled();
        expect(extractor2).not.toHaveBeenCalled();

        extractor1.mockClear();
        extractor2.mockClear();

        parser.addExtractor(extractor2);
        parser.parseString('');
        expect(extractor1).toHaveBeenCalled();
        expect(extractor2).toHaveBeenCalled();
    });

    test('addMessage call', () => {
        let extractor = jest.fn().mockImplementationOnce((node: any, file: any, addMessage: IAddMessageCallback) => {
            addMessage({
                text: 'Foo'
            });
        });

        parser = new parserClass(builder, [extractor]);
        parser.parseString('');

        expect(messages).toEqual([
            {
                text: 'Foo'
            }
        ]);
    });

    test('fluid api', () => {
        let extractor1 = jest.fn(),
            extractor2 = jest.fn();

        parser = new parserClass(builder, [extractor1]);

        expect(parser.parseString('')).toBe(parser);
        expect(parser.parseFilesGlob('tests/fixtures/*.ts')).toBe(parser);
        expect(parser.parseFile('tests/fixtures/foo.ts')).toBe(parser);
        expect(parser.addExtractor(extractor2)).toBe(parser);
    });

    describe('stats', () => {

        let stats: IGettextExtractorStats;

        beforeEach(() => {
            stats = {
                numberOfMessages: 0,
                numberOfPluralMessages: 0,
                numberOfMessageUsages: 0,
                numberOfContexts: 0,
                numberOfParsedFiles: 0,
                numberOfParsedFilesWithMessages: 0
            };
        });

        test('no files with messages', () => {
            let extractor = jest.fn();

            parser = new parserClass(builder, [extractor], stats);

            parser.parseString('');
            parser.parseString('');
            parser.parseString('');

            expect(stats.numberOfParsedFiles).toBe(3);
            expect(stats.numberOfParsedFilesWithMessages).toBe(0);
        });

        test('some files with messages', () => {
            let extractor = jest.fn().mockImplementationOnce((node: any, file: any, addMessage: IAddMessageCallback) => {
                addMessage({
                    text: 'Foo'
                });
            });

            parser = new parserClass(builder, [extractor], stats);

            parser.parseString('');
            parser.parseString('');
            parser.parseString('');

            expect(stats.numberOfParsedFiles).toBe(3);
            expect(stats.numberOfParsedFilesWithMessages).toBe(1);
        });

        test('all files with messages', () => {
            let extractor = jest.fn().mockImplementation((node: any, file: any, addMessage: IAddMessageCallback) => {
                addMessage({
                    text: 'Foo'
                });
            });

            parser = new parserClass(builder, [extractor], stats);

            parser.parseString('');
            parser.parseString('');
            parser.parseString('');

            expect(stats.numberOfParsedFiles).toBe(3);
            expect(stats.numberOfParsedFilesWithMessages).toBe(3);
        });
    });

    test('parsing without extractors', () => {
        const ERROR_MESSAGE = `Missing extractor functions. Provide them when creating the parser or dynamically add extractors using 'addExtractor()'`;

        parser = new parserClass(builder);

        expect(() => {
            parser.parseString('');
        }).toThrowError(ERROR_MESSAGE);

        expect(() => {
            parser.parseFile('tests/fixtures/foo.ts');
        }).toThrowError(ERROR_MESSAGE);

        expect(() => {
            parser.parseFilesGlob('tests/fixtures/*.ts');
        }).toThrowError(ERROR_MESSAGE);
    });

    describe('argument validation', () => {

        beforeEach(() => {
            parser = new parserClass(builder, [jest.fn()]);
        });

        describe('parseFile', () => {

            test('fileName: (none)', () => {
                expect(() => {
                    (<any>parser.parseFile)();
                }).toThrowError(`Missing argument 'fileName'`);
            });

            test('fileName: null', () => {
                expect(() => {
                    (<any>parser.parseFile)(null);
                }).toThrowError(`Argument 'fileName' must be a non-empty string`);
            });

            test('fileName: wrong type', () => {
                expect(() => {
                    (<any>parser.parseFile)(42);
                }).toThrowError(`Argument 'fileName' must be a non-empty string`);
            });
        });

        describe('parseFilesGlob', () => {

            test('pattern: (none)', () => {
                expect(() => {
                    (<any>parser.parseFilesGlob)();
                }).toThrowError(`Missing argument 'pattern'`);
            });

            test('pattern: null', () => {
                expect(() => {
                    (<any>parser.parseFilesGlob)(null);
                }).toThrowError(`Argument 'pattern' must be a non-empty string`);
            });

            test('pattern: wrong type', () => {
                expect(() => {
                    (<any>parser.parseFilesGlob)(42);
                }).toThrowError(`Argument 'pattern' must be a non-empty string`);
            });
        });

        describe('parseString', () => {

            test('source: (none)', () => {
                expect(() => {
                    (<any>parser.parseString)();
                }).toThrowError(`Missing argument 'source'`);
            });

            test('source: null', () => {
                expect(() => {
                    (<any>parser.parseString)(null);
                }).toThrowError(`Argument 'source' must be a string`);
            });

            test('source: wrong type', () => {
                expect(() => {
                    (<any>parser.parseString)(42);
                }).toThrowError(`Argument 'source' must be a string`);
            });

            test('fileName: (none)', () => {
                expect(() => {
                    (<any>parser.parseString)('let foo = 42;');
                }).not.toThrow();
            });

            test('fileName: wrong type', () => {
                expect(() => {
                    (<any>parser.parseString)('let foo = 42;', 42);
                }).toThrowError(`Argument 'fileName' must be a string`);
            });
        });

        describe('addExtractor', () => {

            test('extractor: (none)', () => {
                expect(() => {
                    (<any>parser.addExtractor)();
                }).toThrowError(`Missing argument 'extractor'`);
            });

            test('extractor: null', () => {
                expect(() => {
                    (<any>parser.addExtractor)(null);
                }).toThrowError(`Invalid extractor function provided. 'null' is not a function`);
            });

            test('extractor: wrong type', () => {
                expect(() => {
                    (<any>parser.addExtractor)(42);
                }).toThrowError(`Invalid extractor function provided. '42' is not a function`);
            });
        });
    });
}
