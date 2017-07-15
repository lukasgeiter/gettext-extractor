import { GettextExtractor } from '../src/extractor';

describe('GettextExtractor', () => {

    let extractor: GettextExtractor;

    beforeEach(() => {
        extractor = new GettextExtractor();
    });

    describe('POT string', () => {

        test('default headers', () => {
            let pot = extractor.getPotString();
            expect(pot).toBe(
                `msgid ""\n` +
                `msgstr ""\n` +
                `"Content-Type: text/plain; charset=UTF-8\\n"\n`
            );
        });

        test('additional headers', () => {
            let pot = extractor.getPotString({
                'Project-Id-Version': 'Foo'
            });
            expect(pot).toBe(
                `msgid ""\n` +
                `msgstr ""\n` +
                `"Project-Id-Version: Foo\\n"\n` +
                `"Content-Type: text/plain; charset=UTF-8\\n"\n`
            );
        });

        test('overridden content type header', () => {
            let pot = extractor.getPotString({
                'Content-Type': 'text/plain; charset=ISO-8859-1'
            });
            expect(pot).toBe(
                `msgid ""\n` +
                `msgstr ""\n` +
                `"Content-Type: text/plain; charset=ISO-8859-1\\n"\n`
            );
        });
    });

    describe('argument validation', () => {

        describe('addMessage', () => {

            test('message: (none)', () => {
                expect(() => {
                    (<any>extractor.addMessage)();
                }).toThrowError(`Missing argument 'message'`);
            });

            test('message: null', () => {
                expect(() => {
                    (<any>extractor.addMessage)(null);
                }).toThrowError(`Argument 'message' must be an object`);
            });

            test('message: wrong type', () => {
                expect(() => {
                    (<any>extractor.addMessage)(42);
                }).toThrowError(`Argument 'message' must be an object`);
            });

            test('message.text: (none)', () => {
                expect(() => {
                    (<any>extractor.addMessage)({});
                }).toThrowError(`Property 'message.text' is missing`);
            });

            test('message.text: null', () => {
                expect(() => {
                    (<any>extractor.addMessage)({
                        text: null
                    });
                }).toThrowError(`Property 'message.text' must be a string`);
            });

            test('message.text: wrong type', () => {
                expect(() => {
                    (<any>extractor.addMessage)({
                        text: 42
                    });
                }).toThrowError(`Property 'message.text' must be a string`);
            });

            test('message: only required', () => {
                expect(() => {
                    (<any>extractor.addMessage)({
                        text: 'Foo'
                    });
                }).not.toThrow();
            });

            test('message.textPlural: null', () => {
                expect(() => {
                    (<any>extractor.addMessage)({
                        text: 'Foo',
                        textPlural: null
                    });
                }).toThrowError(`Property 'message.textPlural' must be a string`);
            });

            test('message.textPlural: wrong type', () => {
                expect(() => {
                    (<any>extractor.addMessage)({
                        text: 'Foo',
                        textPlural: 42
                    });
                }).toThrowError(`Property 'message.textPlural' must be a string`);
            });

            test('message.context: null', () => {
                expect(() => {
                    (<any>extractor.addMessage)({
                        text: 'Foo',
                        context: null
                    });
                }).toThrowError(`Property 'message.context' must be a string`);
            });

            test('message.context: wrong type', () => {
                expect(() => {
                    (<any>extractor.addMessage)({
                        text: 'Foo',
                        context: 42
                    });
                }).toThrowError(`Property 'message.context' must be a string`);
            });

            test('message.references: null', () => {
                expect(() => {
                    (<any>extractor.addMessage)({
                        text: 'Foo',
                        references: null
                    });
                }).toThrowError(`Property 'message.references' must be an array`);
            });

            test('message.references: wrong type', () => {
                expect(() => {
                    (<any>extractor.addMessage)({
                        text: 'Foo',
                        references: 42
                    });
                }).toThrowError(`Property 'message.references' must be an array`);
            });

            test('message.comments: null', () => {
                expect(() => {
                    (<any>extractor.addMessage)({
                        text: 'Foo',
                        comments: null
                    });
                }).toThrowError(`Property 'message.comments' must be an array`);
            });

            test('message.comments: wrong type', () => {
                expect(() => {
                    (<any>extractor.addMessage)({
                        text: 'Foo',
                        comments: 42
                    });
                }).toThrowError(`Property 'message.comments' must be an array`);
            });
        });

        describe('getPotString', () => {

            test('headers: wrong type', () => {
                expect(() => {
                    (<any>extractor.getPotString)('foo');
                }).toThrowError(`Argument 'headers' must be an object`);
            });
        });

        describe('savePotFile', () => {

            test('fileName: (none)', () => {
                expect(() => {
                    (<any>extractor.savePotFile)();
                }).toThrowError(`Missing argument 'fileName'`);
            });

            test('fileName: null', () => {
                expect(() => {
                    (<any>extractor.savePotFile)(null);
                }).toThrowError(`Argument 'fileName' must be a non-empty string`);
            });

            test('fileName: wrong type', () => {
                expect(() => {
                    (<any>extractor.savePotFile)(42);
                }).toThrowError(`Argument 'fileName' must be a non-empty string`);
            });

            test('headers: wrong type', () => {
                expect(() => {
                    (<any>extractor.savePotFile)('foo.ts', 'foo');
                }).toThrowError(`Argument 'headers' must be an object`);
            });
        });

        describe('savePotFileAsync', () => {

            test('fileName: (none)', () => {
                expect(() => {
                  (<any>extractor.savePotFileAsync)();
                }).toThrowError(`Missing argument 'fileName'`);
            });

            test('fileName: null', () => {
                expect(() => {
                  (<any>extractor.savePotFileAsync)(null);
                }).toThrowError(`Argument 'fileName' must be a non-empty string`);
            });

            test('fileName: wrong type', () => {
                expect(() => {
                  (<any>extractor.savePotFileAsync)(42);
                }).toThrowError(`Argument 'fileName' must be a non-empty string`);
            });

            test('headers: wrong type', () => {
                expect(() => {
                    (<any>extractor.savePotFileAsync)('foo.ts', 'foo');
                }).toThrowError(`Argument 'headers' must be an object`);
            });
        });

        describe('createJsParser', () => {

            test('extractors: (none)', () => {
                expect(() => {
                    (<any>extractor.createJsParser)();
                }).not.toThrow();
            });

            test('extractors: null', () => {
                expect(() => {
                    (<any>extractor.createJsParser)(null);
                }).toThrowError(`Argument 'extractors' must be a non-empty array`);
            });

            test('extractors: wrong type', () => {
                expect(() => {
                    (<any>extractor.createJsParser)(42);
                }).toThrowError(`Argument 'extractors' must be a non-empty array`);
            });

            test('extractors: []', () => {
                expect(() => {
                    (<any>extractor.createJsParser)([]);
                }).toThrowError(`Argument 'extractors' must be a non-empty array`);
            });

            test('extractors: [(none)]', () => {
                expect(() => {
                    (<any>extractor.createJsParser)([
                        undefined
                    ]);
                }).toThrowError(`Invalid extractor function provided. 'undefined' is not a function`);
            });

            test('extractors: [null]', () => {
                expect(() => {
                    (<any>extractor.createJsParser)([
                        null
                    ]);
                }).toThrowError(`Invalid extractor function provided. 'null' is not a function`);
            });

            test('extractors: [wrong type]', () => {
                expect(() => {
                    (<any>extractor.createJsParser)([
                        42
                    ]);
                }).toThrowError(`Invalid extractor function provided. '42' is not a function`);
            });

            test('extractors: [function, wrong type]', () => {
                expect(() => {
                    (<any>extractor.createJsParser)([
                        () => {},
                        42
                    ]);
                }).toThrowError(`Invalid extractor function provided. '42' is not a function`);
            });
        });
    });
});
