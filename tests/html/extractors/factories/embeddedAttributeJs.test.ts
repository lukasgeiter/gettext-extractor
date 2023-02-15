import { embeddedAttributeJsExtractor } from '../../../../src/html/extractors/factories/embeddedAttributeJs';
import { HtmlParser } from '../../../../src/html/parser';
import { JsParser } from '../../../../src/js/parser';

describe('HTML: Attribute Value as Embedded JS Extractor', () => {

    describe('calling js parser', () => {

        let htmlParser: HtmlParser,
            jsParserMock: JsParser;

        beforeEach(() => {
            jsParserMock = <any>{
                parseString: jest.fn()
            };

            htmlParser = new HtmlParser(undefined!, [
                embeddedAttributeJsExtractor(/:title/, jsParserMock,)
            ]);
        });

        test('single line', () => {
            htmlParser.parseString(`<span :title="__('msg id')" title="__('another')">content</span>`, 'foo.html');
            expect(jsParserMock.parseString).toHaveBeenCalledWith(`__('msg id')`, 'foo.html', {
                lineNumberStart: 1
            });
        });

        test('with lineNumberStart option', () => {
            htmlParser.parseString(`<span :title="__('msg id')" :class="abc">content</span>`, 'foo.html', { lineNumberStart: 10 });
            expect(jsParserMock.parseString).toHaveBeenCalledWith(`__('msg id')`, 'foo.html', {
                lineNumberStart: 10
            });
        });

    });

    describe('argument validation', () => {

        test('filter: (none)', () => {
            expect(() => {
                (<any>embeddedAttributeJsExtractor)();
            }).toThrowError(`Missing argument 'filter'`);
        });
        test('jsParser: (none)', () => {
            expect(() => {
                (<any>embeddedAttributeJsExtractor)(/:title/);
            }).toThrowError(`Missing argument 'jsParser'`);
        });

    });
});
