import * as fs from 'fs';

import { GettextExtractor } from '../../src/extractor';
import { JsExtractors } from '../../src/js/extractors';

describe('Realistic Scenarios', () => {

    test('Scenario 1', () => {
        let expectedPotString = fs.readFileSync('tests/fixtures/realistic/expected.pot').toString().trim();

        let extractor = new GettextExtractor();

        extractor
            .createJsParser([
                JsExtractors.callExpression('getText', {
                    arguments: {
                        text: 0,
                        context: 1
                    }
                }),
                JsExtractors.callExpression('getPlural', {
                    arguments: {
                        text: 1,
                        textPlural: 2,
                        context: 3
                    }
                }),
                JsExtractors.callExpression('[this].translationService.getText', {
                    arguments: {
                        text: 0,
                        context: 1
                    }
                }),
                JsExtractors.callExpression('[this].translationService.getPlural', {
                    arguments: {
                        text: 1,
                        textPlural: 2,
                        context: 3
                    }
                })
            ])
            .parseFilesGlob('tests/fixtures/realistic/**/*.@(ts|js|tsx|jsx)');

        expect(extractor.toPotString()).toBe(expectedPotString);
    });
});
