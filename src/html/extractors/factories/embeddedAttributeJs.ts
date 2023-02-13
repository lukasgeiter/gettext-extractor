import { Attribute } from 'parse5';
import { JsParser } from '../../../js/parser';
import { Validate } from '../../../utils/validate';
import { Element, IHtmlExtractorFunction, Node } from '../../parser';

export type AttributePredicate = null // all
    | string // attribute name pattern
    | ((attribute: Attribute) => boolean);

export function embeddedAttributeJsExtractor(filter: AttributePredicate, jsParser: JsParser): IHtmlExtractorFunction {
    Validate.required.argument({ jsParser });

    return (node: Node, fileName: string, _, lineNumberStart) => {
        if (typeof (node as Element).tagName !== 'string') {
            return;
        }

        const element = node as Element;

        element.attrs.forEach((attr) => {
            if (filter) {
                if (typeof filter === 'string') {
                    const namePattern = filter
                    filter = attr => {
                        if (attr.name.match(namePattern)) { return true }
                        return false
                    }
                }
                if ((typeof filter === 'function') && !filter(attr)) {
                    return
                }
            }
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
