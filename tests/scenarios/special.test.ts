import { GettextExtractor } from '../../src/extractor';
import { JsExtractors } from '../../src/js/extractors';

describe('Special Scenarios', () => {
    test('Scenario 1', () => {
        let extractor = new GettextExtractor();

        let jsParser = extractor.createJsParser([
            JsExtractors.functionCall('getText', {
                arguments: {
                    text: 0,
                    context: 1
                },
                comments: {
                    otherLineLeading: true
                }
            })
        ]);

        jsParser.parseFile('tests/fixtures/foo.ts');

        extractor.addMessage({
            text: 'Manually added',
            context: 'manual'
        });

        expect(extractor.toGettextMessages()).toEqual({
            '': {
                'Something': {
                    msgid: 'Something',
                    comments: {
                        reference: 'tests/fixtures/foo.ts:4',
                        extracted: 'A comment about something'
                    }
                }
            },
            'manual': {
                'Manually added': {
                    msgid: 'Manually added',
                    msgctxt: 'manual'
                }
            }
        });
    });
});
