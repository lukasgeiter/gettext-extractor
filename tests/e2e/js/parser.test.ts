import { IJsParseOptions, JsParser } from '../../../dist/js/parser';
import { GettextExtractor, JsExtractors } from '../../../dist';
import { IAddMessageCallback } from '../../../dist/parser';
import { createUnicodeTests } from '../../fixtures/unicode';

test('one extractor', () => {
    let extractor = jest.fn();
    (new GettextExtractor()).createJsParser([extractor]).parseString('');
    expect(extractor).toHaveBeenCalled();
});

test('multiple extractors', () => {
    let extractor1 = jest.fn(),
        extractor2 = jest.fn();
    (new GettextExtractor()).createJsParser([extractor1, extractor2]).parseString('');
    expect(extractor1).toHaveBeenCalled();
    expect(extractor2).toHaveBeenCalled();
});

test('extractor added later', () => {
    let extractor = jest.fn();
    let parser = (new GettextExtractor()).createJsParser();
    parser.addExtractor(extractor);
    parser.parseString('');
    expect(extractor).toHaveBeenCalled();
});

test('second extractor added later', () => {
    let extractor1 = jest.fn(),
        extractor2 = jest.fn();
    let parser = (new GettextExtractor()).createJsParser([extractor1]);
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
    let extractor = new GettextExtractor();
    let extractorFunction = jest.fn().mockImplementationOnce((node: any, file: any, addMessage: IAddMessageCallback) => {
        addMessage({
            text: 'Foo'
        });
    });

    extractor.createJsParser([extractorFunction]).parseString('');

    expect(extractor.getMessages()).toStrictEqual([
        {
            text: 'Foo',
            textPlural: null,
            context: null,
            comments: [],
            references: []
        }
    ]);
});

test('fluid api', () => {
    let extractor1 = jest.fn(),
        extractor2 = jest.fn();

    let parser = (new GettextExtractor()).createJsParser([extractor1]);

    expect(parser.parseString('')).toBe(parser);
    expect(parser.parseFilesGlob('tests/fixtures/*.ts')).toBe(parser);
    expect(parser.parseFile('tests/fixtures/empty.ts')).toBe(parser);
    expect(parser.addExtractor(extractor2)).toBe(parser);
});

describe('stats', () => {

    test('no files with messages', () => {
        let extractor = new GettextExtractor();
        let extractorFunction = jest.fn();

        let parser = extractor.createJsParser([extractorFunction]);

        parser.parseString('');
        parser.parseString('');
        parser.parseString('');

        expect(extractor.getStats().numberOfParsedFiles).toBe(3);
        expect(extractor.getStats().numberOfParsedFilesWithMessages).toBe(0);
    });

    test('some files with messages', () => {
        let extractor = new GettextExtractor();
        let extractorFunction = jest.fn().mockImplementationOnce((node: any, file: any, addMessage: IAddMessageCallback) => {
            addMessage({
                text: 'Foo'
            });
        });

        let parser = extractor.createJsParser([extractorFunction]);

        parser.parseString('');
        parser.parseString('');
        parser.parseString('');

        expect(extractor.getStats().numberOfParsedFiles).toBe(3);
        expect(extractor.getStats().numberOfParsedFilesWithMessages).toBe(1);
    });

    test('all files with messages', () => {
        let extractor = new GettextExtractor();
        let extractorFunction = jest.fn().mockImplementation((node: any, file: any, addMessage: IAddMessageCallback) => {
            addMessage({
                text: 'Foo'
            });
        });

        let parser = extractor.createJsParser([extractorFunction]);

        parser.parseString('');
        parser.parseString('');
        parser.parseString('');

        expect(extractor.getStats().numberOfParsedFiles).toBe(3);
        expect(extractor.getStats().numberOfParsedFilesWithMessages).toBe(3);
    });
});

test('parsing without extractors', () => {
    const ERROR_MESSAGE = `Missing extractor functions. Provide them when creating the parser or dynamically add extractors using 'addExtractor()'`;

    let parser = (new GettextExtractor()).createJsParser();

    expect(() => {
        parser.parseString('');
    }).toThrowError(ERROR_MESSAGE);

    expect(() => {
        parser.parseFile('tests/fixtures/empty.ts');
    }).toThrowError(ERROR_MESSAGE);

    expect(() => {
        parser.parseFilesGlob('tests/fixtures/*.ts');
    }).toThrowError(ERROR_MESSAGE);
});

describe('argument validation', () => {

    let parser: JsParser;

    beforeEach(() => {
        parser = (new GettextExtractor()).createJsParser([jest.fn()]);
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

        test('options: wrong type', () => {
            expect(() => {
                (<any>parser.parseFile)('foo.ts', 'bar');
            }).toThrowError(`Argument 'options' must be an object`);
        });

        test('options.lineNumberStart: wrong type', () => {
            expect(() => {
                (<any>parser.parseFile)('foo.ts', {
                    lineNumberStart: 'bar'
                });
            }).toThrowError(`Property 'options.lineNumberStart' must be a number`);
        });

        test('options.transformSource: wrong type', () => {
            expect(() => {
                (<any>parser.parseFile)('foo.ts', {
                    transformSource: 42
                });
            }).toThrowError(`Property 'options.transformSource' must be a function`);
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

        test('globOptions: wrong type', () => {
            expect(() => {
                (<any>parser.parseFilesGlob)('*.ts;', 'foo');
            }).toThrowError(`Argument 'globOptions' must be an object`);
        });

        test('options: wrong type', () => {
            expect(() => {
                (<any>parser.parseFilesGlob)('*.ts;', {}, 'foo');
            }).toThrowError(`Argument 'options' must be an object`);
        });

        test('options.lineNumberStart: wrong type', () => {
            expect(() => {
                (<any>parser.parseFilesGlob)('*.ts;', {}, {
                    lineNumberStart: 'foo'
                });
            }).toThrowError(`Property 'options.lineNumberStart' must be a number`);
        });

        test('options.transformSource: wrong type', () => {
            expect(() => {
                (<any>parser.parseFile)('foo.ts', {
                    transformSource: 42
                });
            }).toThrowError(`Property 'options.transformSource' must be a function`);
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
            }).toThrowError(`Argument 'fileName' must be a non-empty string`);
        });

        test('options: wrong type', () => {
            expect(() => {
                (<any>parser.parseString)('let foo = 42;', 'foo.ts', 'bar');
            }).toThrowError(`Argument 'options' must be an object`);
        });

        test('options.lineNumberStart: wrong type', () => {
            expect(() => {
                (<any>parser.parseString)('let foo = 42;', 'foo.ts', {
                    lineNumberStart: 'bar'
                });
            }).toThrowError(`Property 'options.lineNumberStart' must be a number`);
        });

        test('options.transformSource: wrong type', () => {
            expect(() => {
                (<any>parser.parseFile)('foo.ts', {
                    transformSource: 42
                });
            }).toThrowError(`Property 'options.transformSource' must be a function`);
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

describe('unicode', () => {

    createUnicodeTests(text => {
        let extractor = new GettextExtractor();

        extractor
            .createJsParser([
                JsExtractors.callExpression('getText', {
                    arguments: {
                        text: 0
                    }
                })
            ])
            .parseString(`getText("${text}")`);

        expect(extractor.getMessages()).toStrictEqual([
            {
                text: text,
                textPlural: null,
                context: null,
                comments: [],
                references: []
            }
        ]);
    });
});

describe('line number', () => {

    test('first line', assertReferences(
        `getText('Foo')`,
        ['foo.js:1']
    ));

    test('third line', assertReferences(
        `\n\ngetText('Foo')`,
        ['foo.js:3']
    ));

    test('with offset', assertReferences(
        `getText('Foo')`,
        ['foo.js:10'],
        {
            lineNumberStart: 10
        }
    ));
});

test('transform source function', () => {
    let extractor = new GettextExtractor();

    extractor
        .createJsParser([
            JsExtractors.callExpression('GETTEXT', {
                arguments: {
                    text: 0
                }
            })
        ])
        .parseString(`gettext('foo')`, 'foo.js', {
            transformSource: source => source.toUpperCase()
        });

    expect(extractor.getMessages()).toStrictEqual([
        {
            text: 'FOO',
            textPlural: null,
            context: null,
            comments: [],
            references: ['foo.js:1']
        }
    ]);
});

function assertReferences(source: string, references: string[], parseOptions?: IJsParseOptions): () => void {
    return () => {
        let extractor = new GettextExtractor();

        extractor
            .createJsParser([
                JsExtractors.callExpression('getText', {
                    arguments: {
                        text: 0
                    }
                })
            ])
            .parseString(source, 'foo.js', parseOptions);

        expect(extractor.getMessages()).toStrictEqual([{
            text: 'Foo',
            textPlural: null,
            context: null,
            comments: [],
            references: references
        }]);
    };
}
