import { JsParser } from '../../../js/parser';
import { Validate } from '../../../utils/validate';
import { Element, IHtmlExtractorFunction, Node } from '../../parser';
import { ElementSelectorSet } from '../../selector';
import { HtmlUtils } from '../../utils';

/**
 * embeddedJsExtractor extractor messages from element content,
 * but treat them as embedded js:
 *
 *     <span>{{ gettext('msgid') }}</span>
 */
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
                lineNumberStart = lineNumberStart + element.sourceCodeLocation.startLine - 1;
            }
            jsParser.parseString(source, fileName, {
                lineNumberStart
            });
        }
    };
}
