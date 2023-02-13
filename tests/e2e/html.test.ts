import * as fs from 'fs';
import { GettextExtractor, HtmlExtractors, JsExtractors } from '../../dist';

describe('HTML E2E', () => {

    test('example', () => {
        let extractor = new GettextExtractor();

        extractor
            .createHtmlParser([
                HtmlExtractors.elementContent('[translate]', {
                    attributes: {
                        textPlural: 'translate-plural',
                        context: 'translation-context',
                        comment: 'translation-comment'
                    }
                }),
                HtmlExtractors.elementAttribute('[translate-alt]', 'alt')
            ])
            .parseFile('tests/e2e/fixtures/html/header.html');

        expect(extractor.getPotString()).toBe(fs.readFileSync(__dirname + '/fixtures/html/example.expected.pot').toString());
    });

    test('template element', () => {
        let extractor = new GettextExtractor();

        extractor
            .createHtmlParser([
                HtmlExtractors.elementContent('[translate]', {
                    attributes: {
                        textPlural: 'translate-plural',
                        context: 'translation-context'
                    }
                }),
                HtmlExtractors.elementAttribute('[translate-alt]', 'alt')
            ])
            .parseFile('tests/e2e/fixtures/html/template.html');

        expect(extractor.getPotString()).toBe(fs.readFileSync(__dirname + '/fixtures/html/template.expected.pot').toString());
    });

    test('embedded js', () => {
        let extractor = new GettextExtractor();

        let jsParser = extractor.createJsParser([
            JsExtractors.callExpression('translations.getText', {
                arguments: {
                    text: 0
                }
            })
        ]);

        extractor
            .createHtmlParser([
                HtmlExtractors.embeddedJs('script[type=text/javascript]', jsParser)
            ])
            .parseFile('tests/e2e/fixtures/html/embeddedJs.html');

        expect(extractor.getPotString()).toBe(fs.readFileSync(__dirname + '/fixtures/html/embeddedJs.expected.pot').toString());
    });

    test('line number start 11', () => {
        const extractor = new GettextExtractor();
        const jsParser = extractor.createJsParser([
            JsExtractors.callExpression('__', { arguments: { text: 0, } }),
            JsExtractors.callExpression('_n', { arguments: { text: 0, textPlural: 1 } }),
            JsExtractors.callExpression('_xn', { arguments: { context: 0, text: 1, textPlural: 2 } }),
        ]);
        const htmlParser = extractor.createHtmlParser([
            HtmlExtractors.embeddedAttributeJs('^:', jsParser),
            HtmlExtractors.embeddedJs('*', jsParser),
        ]);
        htmlParser.parseFile('tests/e2e/fixtures/html/linenumberStart.html', { lineNumberStart: 11 });
        expect(extractor.getPotString())
            .toBe(fs.readFileSync(__dirname + '/fixtures/html/linenumberStart.expected.pot').toString())
    });

});
