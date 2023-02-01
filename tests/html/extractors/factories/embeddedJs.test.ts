import { HtmlParser } from '../../../../src/html/parser';
import { embeddedJsExtractor } from '../../../../src/html/extractors/factories/embeddedJs';
import { JsParser } from '../../../../src/js/parser';

describe('HTML: Embedded JS Extractor', () => {

    describe('calling js parser', () => {

        let htmlParser: HtmlParser,
            jsParserMock: JsParser;

        beforeEach(() => {
            jsParserMock = <any>{
                parseString: jest.fn()
            };

            htmlParser = new HtmlParser(undefined!, [
                embeddedJsExtractor('script', jsParserMock)
            ]);
        });

        test('single line', () => {
            htmlParser.parseString(`<script>Foo</script>`, 'foo.html');

            expect(jsParserMock.parseString).toHaveBeenCalledWith('Foo', 'foo.html', {
                lineNumberStart: 1
            });
        });

        test('with lineNumberStart option', () => {
            htmlParser.parseString(`<script>Foo</script>`, 'foo.html', { lineNumberStart: 10 });

            expect(jsParserMock.parseString).toHaveBeenCalledWith('Foo', 'foo.html', {
                lineNumberStart: 10
            });
        });

        test('separate line', () => {
            htmlParser.parseString(`<script>\nFoo\n</script>`, 'foo.html');

            expect(jsParserMock.parseString).toHaveBeenCalledWith('\nFoo\n', 'foo.html', {
                lineNumberStart: 1
            });
        });

        test('offset', () => {
            htmlParser.parseString(`<div>\n<h1>Hello World</h1>\n</div>\n\n<script>Foo</script>`, 'foo.html');

            expect(jsParserMock.parseString).toHaveBeenCalledWith('Foo', 'foo.html', {
                lineNumberStart: 5
            });
        });
    });

    describe('argument validation', () => {

        test('selector: (none)', () => {
            expect(() => {
                (<any>embeddedJsExtractor)();
            }).toThrowError(`Missing argument 'selector'`);
        });

        test('selector: null', () => {
            expect(() => {
                (<any>embeddedJsExtractor)(null);
            }).toThrowError(`Argument 'selector' must be a non-empty string`);
        });

        test('selector: wrong type', () => {
            expect(() => {
                (<any>embeddedJsExtractor)(42);
            }).toThrowError(`Argument 'selector' must be a non-empty string`);
        });

        test('jsParser: (none)', () => {
            expect(() => {
                (<any>embeddedJsExtractor)('script');
            }).toThrowError(`Missing argument 'jsParser'`);
        });
    });
});
