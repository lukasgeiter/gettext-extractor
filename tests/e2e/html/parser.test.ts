import { HtmlParser } from '../../../dist/html/parser';
import { GettextExtractor, HtmlExtractors } from '../../../dist';
import { IAddMessageCallback, IParseOptions } from '../../../dist/parser';
import { createUnicodeTests } from '../../fixtures/unicode';

test('one extractor', () => {
    let extractor = jest.fn();
    (new GettextExtractor()).createHtmlParser([extractor]).parseString('');
    expect(extractor).toHaveBeenCalled();
});

test('multiple extractors', () => {
    let extractor1 = jest.fn(),
        extractor2 = jest.fn();
    (new GettextExtractor()).createHtmlParser([extractor1, extractor2]).parseString('');
    expect(extractor1).toHaveBeenCalled();
    expect(extractor2).toHaveBeenCalled();
});

test('extractor added later', () => {
    let extractor = jest.fn();
    let parser = (new GettextExtractor()).createHtmlParser();
    parser.addExtractor(extractor);
    parser.parseString('');
    expect(extractor).toHaveBeenCalled();
});

test('second extractor added later', () => {
    let extractor1 = jest.fn(),
        extractor2 = jest.fn();
    let parser = (new GettextExtractor()).createHtmlParser([extractor1]);
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

    extractor.createHtmlParser([extractorFunction]).parseString('');

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

    let parser = (new GettextExtractor()).createHtmlParser([extractor1]);

    expect(parser.parseString('')).toBe(parser);
    expect(parser.parseFilesGlob('tests/fixtures/*.ts')).toBe(parser);
    expect(parser.parseFile('tests/fixtures/empty.ts')).toBe(parser);
    expect(parser.addExtractor(extractor2)).toBe(parser);
});

describe('stats', () => {

    test('no files with messages', () => {
        let extractor = new GettextExtractor();
        let extractorFunction = jest.fn();

        let parser = extractor.createHtmlParser([extractorFunction]);

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

        let parser = extractor.createHtmlParser([extractorFunction]);

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

        let parser = extractor.createHtmlParser([extractorFunction]);

        parser.parseString('');
        parser.parseString('');
        parser.parseString('');

        expect(extractor.getStats().numberOfParsedFiles).toBe(3);
        expect(extractor.getStats().numberOfParsedFilesWithMessages).toBe(3);
    });
});

test('parsing without extractors', () => {
    const ERROR_MESSAGE = `Missing extractor functions. Provide them when creating the parser or dynamically add extractors using 'addExtractor()'`;

    let parser = (new GettextExtractor()).createHtmlParser();

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

    let parser: HtmlParser;

    beforeEach(() => {
        parser = (new GettextExtractor()).createHtmlParser([jest.fn()]);
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
            .createHtmlParser([
                HtmlExtractors.elementContent('translate')
            ])
            .parseString(`<translate>${text}</translate>`);

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
        `<translate>Foo</translate>`,
        ['foo.html:1']
    ));

    test('third line', assertReferences(
        `\n\n<translate>Foo</translate>`,
        ['foo.html:3']
    ));

    test('with offset', assertReferences(
        `<translate>Foo</translate>`,
        ['foo.html:10'],
        {
            lineNumberStart: 10
        }
    ));
});

test('transform source function', () => {
    let extractor = new GettextExtractor();

    extractor
        .createHtmlParser([
            HtmlExtractors.elementContent('TRANSLATE')
        ])
        .parseString(`<translate>Foo</translate>`, 'foo.html', {
            transformSource: source => source.toUpperCase()
        });

    expect(extractor.getMessages()).toStrictEqual([
        {
            text: 'FOO',
            textPlural: null,
            context: null,
            comments: [],
            references: ['foo.html:1']
        }
    ]);
});

test('template element', () => {
    let extractor = new GettextExtractor();

    extractor
        .createHtmlParser([
            HtmlExtractors.elementContent('translate')
        ])
        .parseString(`<template><translate>Foo</translate></template>`);

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

function assertReferences(source: string, references: string[], parseOptions?: IParseOptions): () => void {
    return () => {
        let extractor = new GettextExtractor();

        extractor
            .createHtmlParser([
                HtmlExtractors.elementContent('translate')
            ])
            .parseString(source, 'foo.html', parseOptions);

        expect(extractor.getMessages()).toStrictEqual([{
            text: 'Foo',
            textPlural: null,
            context: null,
            comments: [],
            references: references
        }]);
    };
}
