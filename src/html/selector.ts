import { CssSelectorParser } from 'css-selector-parser';
import { HtmlUtils } from './utils';
import { Element } from './parser';

export interface IElementSelectorAttribute {
    name: string;
    operator?: '=' | '^=' | '$=' | '*=';
    value?: string;
    regex?: RegExp;
}

export interface IElementSelector {
    tagName?: string;
    id?: string;
    classNames?: string[];
    attributes?: IElementSelectorAttribute[];
}

export class ElementSelectorSet {

    private selectors: ElementSelector[] = [];

    constructor(
        selectors: string | IElementSelector[] = []
    ) {
        if (typeof selectors === 'string') {
            this.addFromString(selectors);
        } else {
            for (let s of selectors) {
                this.add(s);
            }
        }
    }

    public add(selector: IElementSelector): void {
        if (selector instanceof ElementSelector) {
            this.selectors.push(selector);
        } else {
            this.selectors.push(new ElementSelector(selector));
        }
    }

    public addFromString(selectorString: string): void {
        let parser = new CssSelectorParser();
        let selectors: any[];

        parser.registerAttrEqualityMods('^', '$', '*');

        try {
            let result = parser.parse(selectorString);
            selectors = result.type === 'selectors' ? result.selectors : [result];
        } catch (e) {
            throw new Error(`Error parsing selector string: ${e.message}`);
        }

        for (let s of selectors) {
            let selector: IElementSelector = {};
            let rule = s.rule;

            if (rule.rule) {
                throw new Error(`Selector string '${selectorString}' is invalid. Multi-level rules are not supported.`);
            }

            if (rule.tagName && rule.tagName !== '*') {
                selector.tagName = rule.tagName;
            }

            if (rule.id) {
                selector.id = rule.id;
            }

            if (rule.classNames) {
                selector.classNames = rule.classNames;
            }

            if (rule.attrs) {
                selector.attributes = rule.attrs.map((a: any) => {
                    return {
                        name: a.name,
                        operator: a.operator,
                        value: a.value
                    };
                });
            }

            this.add(selector);
        }
    }

    public anyMatch(element: Element): boolean {
        return this.selectors.reduce((matched, s) => matched || s.matches(element), false);
    }

    public allMatch(element: Element): boolean {
        return this.selectors.reduce((matched, s) => matched && s.matches(element), this.selectors.length > 0);
    }
}

export class ElementSelector implements IElementSelector {

    public tagName?: string;
    public id?: string;
    public classNames?: string[];
    public attributes?: IElementSelectorAttribute[];

    constructor(
        private selector: IElementSelector
    ) {
        this.tagName = selector.tagName;
        this.id = selector.id;
        this.classNames = selector.classNames;
        this.attributes = selector.attributes;
    }

    public matches(element: Element): boolean {
        return this.tagNameMatches(element)
            && this.idMatches(element)
            && this.classNamesMatch(element)
            && this.attributesMatch(element);
    }

    private tagNameMatches(element: Element): boolean {
        if (!this.tagName) {
            return true;
        }

        return element.tagName === this.tagName.toLowerCase();
    }

    private idMatches(element: Element): boolean {
        if (!this.id) {
            return true;
        }

        return HtmlUtils.getAttributeValue(element, 'id') === this.id;
    }

    private classNamesMatch(element: Element): boolean {
        if (!this.classNames || !this.classNames.length) {
            return true;
        }

        let classAttributeValue = HtmlUtils.getAttributeValue(element, 'class');
        if (classAttributeValue === null) {
            return false;
        }

        let elementClassNames = classAttributeValue.split(' ');
        for (let className of this.classNames) {
            if (elementClassNames.indexOf(className) === -1) {
                return false;
            }
        }
        return true;
    }

    private attributesMatch(element: Element): boolean {
        if (!this.attributes) {
            return true;
        }

        for (let attribute of this.attributes) {
            let elementAttributeValue = HtmlUtils.getAttributeValue(element, attribute.name);
            if (elementAttributeValue === null) {
                return false;
            }
            if (attribute.value) {
                switch (attribute.operator) {
                    case '^=':
                        if (elementAttributeValue.slice(0, attribute.value.length) !== attribute.value) {
                            return false;
                        }
                        break;
                    case '$=':
                        if (elementAttributeValue.slice(-attribute.value.length) !== attribute.value) {
                            return false;
                        }
                        break;
                    case '*=':
                        if (elementAttributeValue.indexOf(attribute.value) === -1) {
                            return false;
                        }
                        break;
                    case '=':
                    default:
                        if (attribute.value !== elementAttributeValue) {
                            return false;
                        }
                }
            } else if (attribute.regex instanceof RegExp) {
                if (!attribute.regex.test(elementAttributeValue)) {
                    return false;
                }
            }
        }

        return true;
    }
}
