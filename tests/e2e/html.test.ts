import { GettextExtractor, HtmlExtractors, JsExtractors } from '../../dist';
import * as fs from 'fs';

describe('HTML E2E', () => {

    test('example', () => {
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
            .parseFile('tests/e2e/fixtures/html/header.html');

        expect(extractor.getPotString()).toBe(fs.readFileSync(__dirname + '/fixtures/html/example.expected.pot').toString());
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
});
