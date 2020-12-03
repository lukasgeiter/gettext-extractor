import * as ts from 'typescript';
import { RegexUtils } from '../../src/regex/utils';

describe('RegEx: Utils', () => {

    const sampleText =
    `   This is a sample text to check
        if we can find the line number
        of a random word like dragon
        and a little extra line`

    describe('getLineNumber', () => {
        test('standard case', () => {
            expect(RegexUtils.getLineNumber(sampleText, 'dragon')).toBe(3);
        })
    });
});
