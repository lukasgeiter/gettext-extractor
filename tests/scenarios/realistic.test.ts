import * as fs from 'fs';

import { GettextExtractor } from '../../src/extractor';
import { JsExtractors } from '../../src/js/extractors';

describe('Realistic Scenarios', () => {
    test('Scenario 1', () => {
        let expectedPotString = fs.readFileSync('tests/fixtures/realistic/expected.pot').toString().trim();

        let extractor = new GettextExtractor();

        extractor
            .createJsParser([
                JsExtractors.functionCall('getText', {
                    arguments: {
                        text: 0,
                        context: 1
                    }
                }),
                JsExtractors.functionCall('getPlural', {
                    arguments: {
                        text: 1,
                        textPlural: 2,
                        context: 3
                    }
                }),
                JsExtractors.methodCall('translationService', 'getText', {
                    arguments: {
                        text: 0,
                        context: 1
                    }
                }),
                JsExtractors.methodCall('translationService', 'getPlural', {
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
