import * as ts from 'typescript';

import { IGettextExtractorStats } from '../../src/extractor';
import { IMessage, CatalogBuilder } from '../../src/builder';
import { JsParser } from '../../src/js/parser';
import { IAddMessageCallback, Parser } from '../../src/parser';

describe('JsParser', () => {

    let builder: CatalogBuilder,
        parser: JsParser,
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
        parser = new JsParser(builder, [extractor]);
        parser.parseString('');
        expect(extractor).toHaveBeenCalled();
    });

    test('multiple extractors', () => {
        let extractor1 = jest.fn(),
            extractor2 = jest.fn();
        parser = new JsParser(builder, [extractor1, extractor2]);
        parser.parseString('');
        expect(extractor1).toHaveBeenCalled();
        expect(extractor2).toHaveBeenCalled();
    });

    test('extractor added later', () => {
        let extractor = jest.fn();
        parser = new JsParser(builder);
        parser.addExtractor(extractor);
        parser.parseString('');
        expect(extractor).toHaveBeenCalled();
    });

    test('second extractor added later', () => {
        let extractor1 = jest.fn(),
            extractor2 = jest.fn();
        parser = new JsParser(builder, [extractor1]);
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
        let extractor = jest.fn().mockImplementationOnce((node: ts.Node, sourceFile: ts.SourceFile, addMessage: IAddMessageCallback) => {
            addMessage({
                text: 'Foo'
            });
        });

        parser = new JsParser(builder, [extractor]);
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

        parser = new JsParser(builder, [extractor1]);

        expect(parser.parseString('')).toBe(parser);
        expect(parser.parseFilesGlob('tests/fixtures/*.ts')).toBe(parser);
        expect(parser.parseFile('tests/fixtures/foo.ts')).toBe(parser);
        expect(parser.addExtractor(extractor2)).toBe(parser);
    });

    test('parsing without extractors', () => {
        const ERROR_MESSAGE = `Missing extractor functions. Provide them when creating the parser or dynamically add extractors using 'addExtractor()'`;

        parser = new JsParser(builder);

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

            parser = new JsParser(builder, [extractor], stats);

            parser.parseString('');
            parser.parseString('');
            parser.parseString('');

            expect(stats.numberOfParsedFiles).toBe(3);
            expect(stats.numberOfParsedFilesWithMessages).toBe(0);
        });

        test('some files with messages', () => {
            let extractor = jest.fn().mockImplementationOnce((node: ts.Node, sourceFile: ts.SourceFile, addMessage: IAddMessageCallback) => {
                addMessage({
                    text: 'Foo'
                });
            });

            parser = new JsParser(builder, [extractor], stats);

            parser.parseString('');
            parser.parseString('');
            parser.parseString('');

            expect(stats.numberOfParsedFiles).toBe(3);
            expect(stats.numberOfParsedFilesWithMessages).toBe(1);
        });

        test('all files with messages', () => {
            let extractor = jest.fn().mockImplementation((node: ts.Node, sourceFile: ts.SourceFile, addMessage: IAddMessageCallback) => {
                addMessage({
                    text: 'Foo'
                });
            });

            parser = new JsParser(builder, [extractor], stats);

            parser.parseString('');
            parser.parseString('');
            parser.parseString('');

            expect(stats.numberOfParsedFiles).toBe(3);
            expect(stats.numberOfParsedFilesWithMessages).toBe(3);
        });
    });

    describe('createAddMessageCallback', () => {

        let nodeMock: any,
            sourceFileMock: any,
            callback: IAddMessageCallback;

        beforeEach(() => {
            nodeMock = {
                getStart: jest.fn()
            };
            sourceFileMock = {
                fileName: 'foo.ts',
                getLineAndCharacterOfPosition: jest.fn()
            };

            callback = JsParser.createAddMessageCallback(nodeMock, sourceFileMock, messages);
        });

        test('single call', () => {
            sourceFileMock.getLineAndCharacterOfPosition.mockReturnValueOnce({line: 16});

            callback({
                text: 'Foo'
            });

            expect(messages).toEqual([
                {
                    text: 'Foo',
                    references: ['foo.ts:17']
                }
            ]);
        });

        test('multiple calls', () => {
            sourceFileMock.getLineAndCharacterOfPosition.mockReturnValueOnce({line: 16});
            sourceFileMock.getLineAndCharacterOfPosition.mockReturnValueOnce({line: 17});

            callback({
                text: 'Foo'
            });

            callback({
                text: 'Bar'
            });

            expect(messages).toEqual([
                {
                    text: 'Foo',
                    references: ['foo.ts:17']
                },
                {
                    text: 'Bar',
                    references: ['foo.ts:18']
                }
            ]);
        });

        test('plural', () => {
            sourceFileMock.getLineAndCharacterOfPosition.mockReturnValueOnce({line: 16});

            callback({
                text: 'Foo',
                textPlural: 'Foos'
            });

            expect(messages).toEqual([
                {
                    text: 'Foo',
                    textPlural: 'Foos',
                    references: ['foo.ts:17']
                }
            ]);
        });

        test('context', () => {
            sourceFileMock.getLineAndCharacterOfPosition.mockReturnValueOnce({line: 16});

            callback({
                text: 'Foo',
                context: 'Context'
            });

            expect(messages).toEqual([
                {
                    text: 'Foo',
                    context: 'Context',
                    references: ['foo.ts:17']
                }
            ]);
        });

        test('custom line number', () => {
            callback({
                text: 'Foo',
                lineNumber: 100
            });

            expect(sourceFileMock.getLineAndCharacterOfPosition).not.toHaveBeenCalled();

            expect(messages).toEqual([
                {
                    text: 'Foo',
                    references: ['foo.ts:100']
                }
            ]);
        });

        test('custom file name', () => {
            sourceFileMock.getLineAndCharacterOfPosition.mockReturnValueOnce({line: 16});

            callback({
                text: 'Foo',
                fileName: 'bar.ts'
            });

            expect(messages).toEqual([
                {
                    text: 'Foo',
                    references: ['bar.ts:17']
                }
            ]);
        });

        test('custom file name and line number', () => {
            callback({
                text: 'Foo',
                fileName: 'bar.ts',
                lineNumber: 100
            });

            expect(sourceFileMock.getLineAndCharacterOfPosition).not.toHaveBeenCalled();

            expect(messages).toEqual([
                {
                    text: 'Foo',
                    references: ['bar.ts:100']
                }
            ]);
        });

        test('string literal file name', () => {
            sourceFileMock.getLineAndCharacterOfPosition.mockReturnValueOnce({line: 16});
            sourceFileMock.fileName = Parser.STRING_LITERAL_FILENAME;

            callback({
                text: 'Foo'
            });

            expect(messages).toEqual([
                {
                    text: 'Foo'
                }
            ]);
        });

        test('comments', () => {
            sourceFileMock.getLineAndCharacterOfPosition.mockReturnValueOnce({line: 16});

            callback({
                text: 'Foo',
                comments: ['Comment 1', 'Comment 2']
            });

            expect(messages).toEqual([
                {
                    text: 'Foo',
                    references: ['foo.ts:17'],
                    comments: ['Comment 1', 'Comment 2']
                }
            ]);
        });
    });

    describe('argument validation', () => {
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
});
