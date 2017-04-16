import { HtmlParser } from '../../../../src/html/parser';
import { CatalogBuilder, IMessage } from '../../../../src/builder';
import { elementAttributeExtractor } from '../../../../src/html/extractors/factories/elementAttribute';

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
    });
});
