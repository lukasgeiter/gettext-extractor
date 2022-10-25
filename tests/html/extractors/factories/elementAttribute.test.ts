import { HtmlParser } from '../../../../src/html/parser';
import { CatalogBuilder, IMessage } from '../../../../src/builder';
import { elementAttributeExtractor } from '../../../../src/html/extractors/factories/elementAttribute';
import { elementContentExtractor } from '../../../../src/html/extractors/factories/elementContent';

describe('HTML: Element Attribute Extractor', () => {

    let builder: CatalogBuilder,
        messages: IMessage[],
        parser: HtmlParser;

    beforeEach(() => {
        messages = [];

        builder = <any>{
            addMessage: jest.fn((message: IMessage) => {
                messages.push(message);
            })
        };
    });

    describe('standard', () => {

        beforeEach(() => {
            parser = new HtmlParser(builder, [
                elementAttributeExtractor('translate', 'text', {
                    attributes: {
                        context: 'context',
                        textPlural: 'plural'
                    }
                })
            ]);
        });

        test('just text', () => {
            parser.parseString(`<translate text="Foo"></translate>`);

            expect(messages).toEqual([
                {
                    text: 'Foo'
                }
            ]);
        });

        test('with context', () => {
            parser.parseString(`<translate text="Foo" context="Context"></translate>`);

            expect(messages).toEqual([
                {
                    text: 'Foo',
                    context: 'Context'
                }
            ]);
        });

        test('plural', () => {
            parser.parseString(`<translate text="Foo" plural="Foos"></translate>`);

            expect(messages).toEqual([
                {
                    text: 'Foo',
                    textPlural: 'Foos'
                }
            ]);
        });

        test('plural with context', () => {
            parser.parseString(`<translate text="Foo" plural="Foos" context="Context"></translate>`);

            expect(messages).toEqual([
                {
                    text: 'Foo',
                    textPlural: 'Foos',
                    context: 'Context'
                }
            ]);
        });

        test('missing text', () => {
            parser.parseString(`<translate plural="Foos" context="Context"></translate>`);

            expect(messages).toEqual([]);
        });
    });

    describe('just text', () => {

        beforeEach(() => {
            parser = new HtmlParser(builder, [
                elementAttributeExtractor('translate', 'text')
            ]);
        });

        test('with context', () => {
            parser.parseString(`<translate text="Foo" context="Context?"></translate>`);

            expect(messages).toEqual([
                {
                    text: 'Foo'
                }
            ]);
        });

        test('plural', () => {
            parser.parseString(`<translate text="Foo" plural="Foos?"></translate>`);

            expect(messages).toEqual([
                {
                    text: 'Foo'
                }
            ]);
        });

        test('plural with context', () => {
            parser.parseString(`<translate text="Foo" plural="Foos?" context="Context?"></translate>`);

            expect(messages).toEqual([
                {
                    text: 'Foo'
                }
            ]);
        });
    });

    describe('comment', () => {

        beforeEach(() => {
            parser = new HtmlParser(builder, [
                elementAttributeExtractor('translate', 'text', {
                    attributes: {
                        comment: 'comment'
                    }
                })
            ]);
        });

        test('just text', () => {
            parser.parseString(`<translate text="Foo"></translate>`);

            expect(messages).toEqual([
                {
                    text: 'Foo'
                }
            ]);
        });

        test('with comment', () => {
            parser.parseString(`<translate text="Foo" comment="Foo Bar"></translate>`);

            expect(messages).toEqual([
                {
                    text: 'Foo',
                    comments: [
                        'Foo Bar'
                    ]
                }
            ]);
        });

        test('empty comment', () => {
            parser.parseString(`<translate text="Foo" comment=""></translate>`);

            expect(messages).toEqual([
                {
                    text: 'Foo'
                }
            ]);
        });
    });

    describe('argument validation', () => {

        test('selector: (none)', () => {
            expect(() => {
                (<any>elementAttributeExtractor)();
            }).toThrowError(`Missing argument 'selector'`);
        });

        test('selector: null', () => {
            expect(() => {
                (<any>elementAttributeExtractor)(null);
            }).toThrowError(`Argument 'selector' must be a non-empty string`);
        });

        test('selector: wrong type', () => {
            expect(() => {
                (<any>elementAttributeExtractor)(42);
            }).toThrowError(`Argument 'selector' must be a non-empty string`);
        });

        test('textAttribute: (none)', () => {
            expect(() => {
                (<any>elementAttributeExtractor)('[translate]');
            }).toThrowError(`Missing argument 'textAttribute'`);
        });

        test('textAttribute: null', () => {
            expect(() => {
                (<any>elementAttributeExtractor)('[translate]', null);
            }).toThrowError(`Argument 'textAttribute' must be a non-empty string`);
        });

        test('textAttribute: wrong type', () => {
            expect(() => {
                (<any>elementAttributeExtractor)('[translate]', 42);
            }).toThrowError(`Argument 'textAttribute' must be a non-empty string`);
        });

        test('options: wrong type', () => {
            expect(() => {
                (<any>elementAttributeExtractor)('[translate]', 'translate', 'foo');
            }).toThrowError(`Argument 'options' must be an object`);
        });

        test('options.attributes: wrong type', () => {
            expect(() => {
                (<any>elementAttributeExtractor)('[translate]', 'translate', {
                    attributes: 'foo'
                });
            }).toThrowError(`Property 'options.attributes' must be an object`);
        });

        test('options.attributes.textPlural: wrong type', () => {
            expect(() => {
                (<any>elementAttributeExtractor)('[translate]', 'translate', {
                    attributes: {
                        textPlural: 42
                    }
                });
            }).toThrowError(`Property 'options.attributes.textPlural' must be a string`);
        });

        test('options.attributes.context: wrong type', () => {
            expect(() => {
                (<any>elementAttributeExtractor)('[translate]', 'translate', {
                    attributes: {
                        context: 42
                    }
                });
            }).toThrowError(`Property 'options.attributes.context' must be a string`);
        });

        test('options.attributes.comment: wrong type', () => {
            expect(() => {
                (<any>elementAttributeExtractor)('[translate]', 'translate', {
                    attributes: {
                        comment: 42
                    }
                });
            }).toThrowError(`Property 'options.attributes.comment' must be a string`);
        });

        test('options.content: wrong type', () => {
            expect(() => {
                (<any>elementContentExtractor)('[translate]', {
                    content: 'foo'
                });
            }).toThrowError(`Property 'options.content' must be an object`);
        });

        test('options.content.trimWhiteSpace: wrong type', () => {
            expect(() => {
                (<any>elementContentExtractor)('[translate]', {
                    content: {
                        trimWhiteSpace: 'foo'
                    }
                });
            }).toThrowError(`Property 'options.content.trimWhiteSpace' must be a boolean`);
        });

        test('options.content.preserveIndentation: wrong type', () => {
            expect(() => {
                (<any>elementContentExtractor)('[translate]', {
                    content: {
                        preserveIndentation: 'foo'
                    }
                });
            }).toThrowError(`Property 'options.content.preserveIndentation' must be a boolean`);
        });

        test('options.content.replaceNewLines: wrong type', () => {
            expect(() => {
                (<any>elementContentExtractor)('[translate]', {
                    content: {
                        replaceNewLines: 42
                    }
                });
            }).toThrowError(`Property 'options.content.replaceNewLines' must be false or a string`);
        });

        test('options.content.replaceNewLines: true', () => {
            expect(() => {
                (<any>elementContentExtractor)('[translate]', {
                    content: {
                        replaceNewLines: true
                    }
                });
            }).toThrowError(`Property 'options.content.replaceNewLines' must be false or a string`);
        });
    });

    describe('argument proxying', () => {
        test('options.content.options: applies for all attributes', () => {
            parser = new HtmlParser(builder, [
                elementAttributeExtractor('translate', 'text', {
                    attributes: {
                        textPlural: 'plural',
                        context: 'context',
                        comment: 'comment'
                    },
                    content: {
                        preserveIndentation: false,
                        replaceNewLines: '',
                        trimWhiteSpace: true
                    }
                })
            ]);

            parser.parseString(`
                <translate
                    text="
                        Foo
                    "
                    plural="
                        Foos
                    "
                    comment="
                        Comment
                    "
                    context="
                        Context
                    "/>
            `);

            expect(messages).toEqual([
                {
                    text: 'Foo',
                    textPlural: 'Foos',
                    context: 'Context',
                    comments: ['Comment']
                }
            ]);
        });
    });
});
