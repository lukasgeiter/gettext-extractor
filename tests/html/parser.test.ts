import { HtmlParser, TextNode } from '../../src/html/parser';
import { registerCommonParserTests } from '../parser.common';
import { UnicodeSamples } from '../fixtures/unicode';
import { CatalogBuilder } from '../../src/builder';

describe('HtmlParser', () => {

    registerCommonParserTests(HtmlParser);

    describe('unicode', () => {

        function check(text: string): void {
            let parser = new HtmlParser(new CatalogBuilder(), [(node: TextNode) => {
                if (node.nodeName === '#text') {
                    expect(node.value).toEqual(text);
                }
            }]);

            parser.parseString(`<span>${text}</span>`);
        }

        test('danish', () => {
            check(UnicodeSamples.danish);
        });

        test('german', () => {
            check(UnicodeSamples.german);
        });

        test('greek', () => {
            check(UnicodeSamples.greek);
        });

        test('english', () => {
            check(UnicodeSamples.english);
        });

        test('spanish', () => {
            check(UnicodeSamples.spanish);
        });

        test('french', () => {
            check(UnicodeSamples.french);
        });

        test('irish gaelic', () => {
            check(UnicodeSamples.irishGaelic);
        });

        test('hungarian', () => {
            check(UnicodeSamples.hungarian);
        });

        test('icelandic', () => {
            check(UnicodeSamples.icelandic);
        });

        test('japanese', () => {
            check(UnicodeSamples.japanese);
        });

        test('hebrew', () => {
            check(UnicodeSamples.hebrew);
        });

        test('polish', () => {
            check(UnicodeSamples.polish);
        });

        test('russian', () => {
            check(UnicodeSamples.russian);
        });

        test('thai', () => {
            check(UnicodeSamples.thai);
        });

        test('turkish', () => {
            check(UnicodeSamples.turkish);
        });
    });
});
