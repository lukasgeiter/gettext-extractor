import { Attribute } from 'parse5';
import { JsParser } from '../../../js/parser';
import { Validate } from '../../../utils/validate';
import { Element, IHtmlExtractorFunction, Node } from '../../parser';

export type AttributePredicate = (attribute: Attribute) => boolean;

export function embeddedAttributeJsExtractor(filter: RegExp | AttributePredicate, jsParser: JsParser,): IHtmlExtractorFunction {
    Validate.required.argument({ filter });
    Validate.required.argument({ jsParser });
    let test: AttributePredicate;
    if (typeof filter === 'function') {
        test = filter;
    } else {
        test = attr => filter.test(attr.name);
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
