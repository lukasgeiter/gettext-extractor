import { HtmlExtractors } from '../../../dist';

describe('argument validation', () => {

    test('selector: (none)', () => {
        expect(() => {
            (<any>HtmlExtractors.embeddedJs)();
        }).toThrowError(`Missing argument 'selector'`);
    });

    test('selector: null', () => {
        expect(() => {
            (<any>HtmlExtractors.embeddedJs)(null);
        }).toThrowError(`Argument 'selector' must be a non-empty string`);
    });

    test('selector: wrong type', () => {
        expect(() => {
            (<any>HtmlExtractors.embeddedJs)(42);
        }).toThrowError(`Argument 'selector' must be a non-empty string`);
    });

    test('jsParser: (none)', () => {
        expect(() => {
            (<any>HtmlExtractors.embeddedJs)('script');
        }).toThrowError(`Missing argument 'jsParser'`);
    });
});
