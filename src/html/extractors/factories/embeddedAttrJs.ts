import { JsParser } from '../../../js/parser';
import { Validate } from '../../../utils/validate';
import { Element, IHtmlExtractorFunction, Node } from '../../parser';
/**
 * embeddedAttrJsExtractor extractor messages from element attribute,
 * but treat them as embedded js:
 *
 *     <span :title="_xn('ctx', 'msgid', 'plural', n, args)">See my title</span>
 */

export function embeddedAttrJsExtractor(selector: string, jsParser: JsParser): IHtmlExtractorFunction {
    Validate.required.nonEmptyString({ selector });
    Validate.required.argument({ jsParser });

    return (node: Node, fileName: string, _, lineNumberStart) => {
        if (typeof (node as Element).tagName !== 'string') {
            return;
        }

        const element = node as Element;
        element.attrs.forEach((attr) => {
            const startLine = element.sourceCodeLocation?.attrs[attr.name]?.startLine;
            if (startLine) {
                lineNumberStart = lineNumberStart + startLine - 1;
            }
            jsParser.parseString(attr.value, fileName, {
                lineNumberStart
            });
        });
    };
}
