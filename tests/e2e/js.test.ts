import { GettextExtractor, JsExtractors } from '../../dist';
import * as fs from 'fs';

describe('JavaScript E2E', () => {

    test('example', () => {
        let extractor = new GettextExtractor();

        extractor
            .createJsParser([
                JsExtractors.callExpression(['t', '[this].translations.get'], {
                    arguments: {
                        text: 0,
                        context: 1
                    }
                }),
                JsExtractors.callExpression('[this].translations.plural', {
                    arguments: {
                        text: 1,
                        textPlural: 2,
                        context: 3
                    }
                })
            ])
            .parseFilesGlob('tests/e2e/fixtures/js/**/*.@(js|jsx)');

        expect(extractor.getPotString()).toBe(fs.readFileSync(__dirname + '/fixtures/js/example.expected.pot').toString());
    });

    test('multi-line', () => {
        let extractor = new GettextExtractor();

        extractor
            .createJsParser([
                JsExtractors.callExpression(['translate'], {
                    arguments: {
                        text: 0
                    }
                }),
                JsExtractors.callExpression(['translate_trim'], {
                    arguments: {
                        text: 0
                    },
                    content: {
                        trimWhiteSpace: true,
                        preserveIndentation: false
                    }
                })
            ])
            .parseFilesGlob('tests/e2e/fixtures/js/**/*.js');

        expect(extractor.getPotString()).toBe(fs.readFileSync(__dirname + '/fixtures/js/multiline.expected.pot').toString());
    });
});
