import { HtmlParser } from '../../../../src/html/parser';
import { CatalogBuilder, IMessage } from '../../../../src/builder';
import { elementContentExtractor } from '../../../../src/html/extractors/factories/elementContent';

describe('HTML: Element Content Extractor', () => {

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
                elementContentExtractor('translate', {
                    attributes: {
                        context: 'context',
                        textPlural: 'plural'
                    }
                })
            ]);
        });

        test('just text', () => {
            parser.parseString(`<translate>Foo</translate>`);

            expect(messages).toEqual([
                {
                    text: 'Foo'
                }
            ]);
        });

        test('with context', () => {
            parser.parseString(`<translate context="Context">Foo</translate>`);

            expect(messages).toEqual([
                {
                    text: 'Foo',
                    context: 'Context'
                }
            ]);
        });

        test('plural', () => {
            parser.parseString(`<translate plural="Foos">Foo</translate>`);

            expect(messages).toEqual([
                {
                    text: 'Foo',
                    textPlural: 'Foos'
                }
            ]);
        });

        test('plural with context', () => {
            parser.parseString(`<translate plural="Foos" context="Context">Foo</translate>`);

            expect(messages).toEqual([
                {
                    text: 'Foo',
                    textPlural: 'Foos',
                    context: 'Context'
                }
            ]);
        });
    });

    describe('just text', () => {

        beforeEach(() => {
            parser = new HtmlParser(builder, [
                elementContentExtractor('translate')
            ]);
        });

        test('with context', () => {
            parser.parseString(`<translate context="Context?">Foo</translate>`);

            expect(messages).toEqual([
                {
                    text: 'Foo'
                }
            ]);
        });

        test('plural', () => {
            parser.parseString(`<translate plural="Foos?">Foo</translate>`);

            expect(messages).toEqual([
                {
                    text: 'Foo'
                }
            ]);
        });

        test('plural with context', () => {
            parser.parseString(`<translate plural="Foos?" context="Context?">Foo</translate>`);

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
                (<any>elementContentExtractor)();
            }).toThrowError(`Missing argument 'selector'`);
        });

        test('selector: null', () => {
            expect(() => {
                (<any>elementContentExtractor)(null);
            }).toThrowError(`Argument 'selector' must be a non-empty string`);
        });

        test('selector: wrong type', () => {
            expect(() => {
                (<any>elementContentExtractor)(42);
            }).toThrowError(`Argument 'selector' must be a non-empty string`);
        });

        test('options: wrong type', () => {
            expect(() => {
                (<any>elementContentExtractor)('[translate]', 'foo');
            }).toThrowError(`Argument 'options' must be an object`);
        });

        test('options.attributes: wrong type', () => {
            expect(() => {
                (<any>elementContentExtractor)('[translate]', {
                    attributes: 'foo'
                });
            }).toThrowError(`Property 'options.attributes' must be an object`);
        });

        test('options.attributes.textPlural: wrong type', () => {
            expect(() => {
                (<any>elementContentExtractor)('[translate]', {
                    attributes: {
                        textPlural: 42
                    }
                });
            }).toThrowError(`Property 'options.attributes.textPlural' must be a string`);
        });

        test('options.attributes.context: wrong type', () => {
            expect(() => {
                (<any>elementContentExtractor)('[translate]', {
                    attributes: {
                        context: 42
                    }
                });
            }).toThrowError(`Property 'options.attributes.context' must be a string`);
        });

        test('options.attributes.comment: wrong type', () => {
            expect(() => {
                (<any>elementContentExtractor)('[translate]', {
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
});
