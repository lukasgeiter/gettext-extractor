import { JsParser } from '../../../js/parser';
import { IHtmlExtractorFunction, Element, Node } from '../../parser';
import { ElementSelectorSet } from '../../selector';
import { HtmlUtils } from '../../utils';
import { Validate } from '../../../utils/validate';

export function embeddedJsExtractor(selector: string, jsParser: JsParser): IHtmlExtractorFunction {
    Validate.required.nonEmptyString({ selector });
    Validate.required.argument({ jsParser });

    let selectors = new ElementSelectorSet(selector);

    return (node: Node, fileName: string, _, lineNumberStart) => {
        if (typeof (<Element>node).tagName !== 'string') {
            return;
        }

        let element = <Element>node;

        if (selectors.anyMatch(element)) {
            let source = HtmlUtils.getElementContent(element, {
                trimWhiteSpace: false,
                preserveIndentation: true,
                replaceNewLines: false
            });
            if (element.sourceCodeLocation && element.sourceCodeLocation.startLine) {
                lineNumberStart = lineNumberStart + element.sourceCodeLocation.startLine;
            }
            jsParser.parseString(source, fileName, {
                // since in src/js/parser.ts we have return `lineNumberStart + location.line(1-based)`
                // so here should minus one
                lineNumberStart: lineNumberStart - 1
            });
        }
    };
}
