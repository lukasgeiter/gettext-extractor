import { embeddedAttributeJsExtractor } from "../../../../src/html/extractors/factories/embeddedAttributeJs";
import { HtmlParser } from "../../../../src/html/parser";
import { JsParser } from "../../../../src/js/parser";

describe("HTML: Attribute Value as Embedded JS Extractor", () => {
    describe("calling js parser", () => {
        let jsParserMock: JsParser;

        beforeEach(() => {
            jsParserMock = <any>{
                parseString: jest.fn(),
            };
        });

        test("use regex filter / with line number start", () => {
            const htmlParser = new HtmlParser(undefined!, [
                embeddedAttributeJsExtractor(/:title/, jsParserMock),
            ]);
            htmlParser.parseString(
                `<span :title="__('msg id')" :class="abc">content</span>`,
                "foo.html",
                { lineNumberStart: 10 }
            );
            expect(jsParserMock.parseString).toHaveBeenCalledWith(
                `__('msg id')`,
                "foo.html",
                {
                    lineNumberStart: 10,
                }
            );
        });

        test("use filter function", () => {
            const htmlParser = new HtmlParser(undefined!, [
                embeddedAttributeJsExtractor((e) => {
                    return e.name.startsWith(":");
                }, jsParserMock),
            ]);
            htmlParser.parseString(
                `<span :title="__('title')" class="title">Hello</span>`,
                "foo.html"
            );
            expect(jsParserMock.parseString).toHaveBeenCalledWith(
                `__('title')`,
                "foo.html",
                { lineNumberStart: 1 }
            );
        });
    });

    describe("argument validation", () => {
        test("filter: (none)", () => {
            expect(() => {
                (<any>embeddedAttributeJsExtractor)();
            }).toThrowError(`Missing argument 'filter'`);
        });
        test("jsParser: (none)", () => {
            expect(() => {
                (<any>embeddedAttributeJsExtractor)(/:title/);
            }).toThrowError(`Missing argument 'jsParser'`);
        });
    });
});
