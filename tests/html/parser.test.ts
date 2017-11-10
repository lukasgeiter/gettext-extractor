import { HtmlParser, TextNode } from '../../src/html/parser';
import { registerCommonParserTests } from '../parser.common';
import { UnicodeSamples } from '../fixtures/unicode';
import { CatalogBuilder } from '../../src/builder';

describe('HtmlParser', () => {

    registerCommonParserTests(HtmlParser);

    describe('line number', () => {

        let parser: HtmlParser;
        let builderMock: CatalogBuilder;

        beforeEach(() => {
            builderMock = <any>{
                addMessage: jest.fn()
            };
            parser = new HtmlParser(builderMock, [(node: TextNode, fileName: string, addMessage) => {
                if (node.nodeName === '#text') {
                    addMessage({
                        text: node.value
                    });
                }
            }]);
        });

        test('first line', () => {
            parser.parseString(`<span>Foo</span>`, 'foo.html');

            expect(builderMock.addMessage).toHaveBeenCalledWith({
                text: 'Foo',
                references: ['foo.html:1']
            });
        });

        test('third line', () => {
            parser.parseString(`\n\n<span>Foo</span>`, 'foo.html');

            expect(builderMock.addMessage).toHaveBeenCalledWith({
                text: 'Foo',
                references: ['foo.html:3']
            });
        });

        test('with offset', () => {
            parser.parseString(`<span>Foo</span>`, 'foo.html', {
                lineNumberStart: 10
            });

            expect(builderMock.addMessage).toHaveBeenCalledWith({
                text: 'Foo',
                references: ['foo.html:10']
            });
        });
    });

    test('transform source function', () => {
        let parser = new HtmlParser(<any>{}, [jest.fn()]);
        let parseFunctionMock = (<any>parser).parse = jest.fn(() => []);

        const fileName = 'foo.html';
        const parseOptions = {
            transformSource: source => source.toUpperCase()
        };

        parser.parseString('foo', fileName, parseOptions);
        expect(parseFunctionMock).toHaveBeenCalledWith('FOO', fileName, parseOptions);
    });

    describe('unicode', () => {

        function check(text: string): void {
            let parser = new HtmlParser(new CatalogBuilder(), [(node: TextNode) => {
                if (node.nodeName === '#text') {
                    expect(node.value).toEqual(text);
                }
            }]);

            parser.parseString(`<span>${text}</span>`);
        }

        test('danish', () => {
            check(UnicodeSamples.danish);
        });

        test('german', () => {
            check(UnicodeSamples.german);
        });

        test('greek', () => {
            check(UnicodeSamples.greek);
        });

        test('english', () => {
            check(UnicodeSamples.english);
        });

        test('spanish', () => {
            check(UnicodeSamples.spanish);
        });

        test('french', () => {
            check(UnicodeSamples.french);
        });

        test('irish gaelic', () => {
            check(UnicodeSamples.irishGaelic);
        });

        test('hungarian', () => {
            check(UnicodeSamples.hungarian);
        });

        test('icelandic', () => {
            check(UnicodeSamples.icelandic);
        });

        test('japanese', () => {
            check(UnicodeSamples.japanese);
        });

        test('hebrew', () => {
            check(UnicodeSamples.hebrew);
        });

        test('polish', () => {
            check(UnicodeSamples.polish);
        });

        test('russian', () => {
            check(UnicodeSamples.russian);
        });

        test('thai', () => {
            check(UnicodeSamples.thai);
        });

        test('turkish', () => {
            check(UnicodeSamples.turkish);
        });
    });
});
