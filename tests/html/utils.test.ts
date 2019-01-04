import * as parse5 from 'parse5';
import { HtmlUtils } from '../../src/html/utils';
import { Element } from '../../src/html/parser';

describe('HTML: Utils', () => {

    function createElement(source: string): Element {
        return <Element>(<any>parse5.parse(source)).childNodes[0].childNodes[1].childNodes[0];
    }

    describe('getAttributeValue', () => {

        test('normal attribute value', () => {
            expect(HtmlUtils.getAttributeValue(createElement('<p foo="bar"/>'), 'foo')).toBe('bar');
        });

        test('attribute missing', () => {
            expect(HtmlUtils.getAttributeValue(createElement('<p/>'), 'foo')).toBe(null);
        });

        test('empty string', () => {
            expect(HtmlUtils.getAttributeValue(createElement('<p foo=""/>'), 'foo')).toBe('');
        });

        test('no value', () => {
            expect(HtmlUtils.getAttributeValue(createElement('<p foo/>'), 'foo')).toBe('');
        });

        test('"null"', () => {
            expect(HtmlUtils.getAttributeValue(createElement('<p foo="null"/>'), 'foo')).toBe('null');
        });

        test('numeric', () => {
            expect(HtmlUtils.getAttributeValue(createElement('<p foo="42"/>'), 'foo')).toBe('42');
        });
    });

    describe('getElementContent', () => {

        function getContent(source: string): string {
            return HtmlUtils.getElementContent(createElement(source), {
                preserveIndentation: true,
                trimWhiteSpace: true,
                replaceNewLines: false
            });
        }

        test('single line', () => {
            expect(getContent('<div>Foo Bar</div>')).toBe('Foo Bar');
        });

        test('nested element', () => {
            expect(getContent('<div>Foo <strong>Bar</strong></div>')).toBe('Foo <strong>Bar</strong>');
        });

        test('indentation', () => {
            expect(getContent(
                '<div>\n' +
                '   Foo\n' +
                '   Bar\n' +
                '</div>'
            )).toBe(
                '   Foo\n' +
                '   Bar'
            );
        });

        describe('un-escaping', () => {

            test('&', () => {
                expect(getContent('<div>Foo & Bar</div>')).toBe('Foo & Bar');
            });

            test('<', () => {
                expect(getContent('<div>Foo < Bar</div>')).toBe('Foo < Bar');
            });

            test('>', () => {
                expect(getContent('<div>Foo > Bar</div>')).toBe('Foo > Bar');
            });
        });
    });
});
