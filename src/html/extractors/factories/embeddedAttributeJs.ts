import { Attribute } from 'parse5';
import { JsParser } from '../../../js/parser';
import { Validate } from '../../../utils/validate';
import { Element, IHtmlExtractorFunction, Node } from '../../parser';

export type AttributePredicate = (attribute: Attribute) => boolean;

export function embeddedAttributeJsExtractor(filter: null | string | AttributePredicate, jsParser: JsParser): IHtmlExtractorFunction {
    Validate.required.argument({ jsParser });
    let test: AttributePredicate = attr => true;
    if (typeof filter === 'string') {
        const namePattern = filter;
        test = (attr: Attribute) => {
            if (attr.name.match(namePattern)) { return true; }
            return false;
        };
    } else if (typeof filter === 'function') {
        test = filter;
    }

    return (node: Node, fileName: string, _, lineNumberStart) => {
        if (typeof (node as Element).tagName !== 'string') {
            return;
        }

        const element = node as Element;

        element.attrs.filter(test).forEach((attr) => {
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
