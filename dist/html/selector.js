"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElementSelector = exports.ElementSelectorSet = void 0;
const css_selector_parser_1 = require("css-selector-parser");
const utils_1 = require("./utils");
class ElementSelectorSet {
    constructor(selectors = []) {
        this.selectors = [];
        if (typeof selectors === 'string') {
            this.addFromString(selectors);
        }
        else {
            for (let s of selectors) {
                this.add(s);
            }
        }
    }
    add(selector) {
        if (selector instanceof ElementSelector) {
            this.selectors.push(selector);
        }
        else {
            this.selectors.push(new ElementSelector(selector));
        }
    }
    addFromString(selectorString) {
        let parser = new css_selector_parser_1.CssSelectorParser();
        let selectors;
        parser.registerAttrEqualityMods('^', '$', '*');
        try {
            let result = parser.parse(selectorString);
            selectors = result.type === 'selectors' ? result.selectors : [result];
        }
        catch (e) {
            throw new Error(`Error parsing selector string: ${e.message}`);
        }
        for (let s of selectors) {
            let selector = {};
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
                selector.attributes = rule.attrs.map((a) => {
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
    anyMatch(element) {
        return this.selectors.reduce((matched, s) => matched || s.matches(element), false);
    }
    allMatch(element) {
        return this.selectors.reduce((matched, s) => matched && s.matches(element), this.selectors.length > 0);
    }
}
exports.ElementSelectorSet = ElementSelectorSet;
class ElementSelector {
    constructor(selector) {
        this.selector = selector;
        this.tagName = selector.tagName;
        this.id = selector.id;
        this.classNames = selector.classNames;
        this.attributes = selector.attributes;
    }
    matches(element) {
        return this.tagNameMatches(element)
            && this.idMatches(element)
            && this.classNamesMatch(element)
            && this.attributesMatch(element);
    }
    tagNameMatches(element) {
        if (!this.tagName) {
            return true;
        }
        return element.tagName === this.tagName.toLowerCase();
    }
    idMatches(element) {
        if (!this.id) {
            return true;
        }
        return utils_1.HtmlUtils.getAttributeValue(element, 'id') === this.id;
    }
    classNamesMatch(element) {
        if (!this.classNames || !this.classNames.length) {
            return true;
        }
        let classAttributeValue = utils_1.HtmlUtils.getAttributeValue(element, 'class');
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
    attributesMatch(element) {
        if (!this.attributes) {
            return true;
        }
        for (let attribute of this.attributes) {
            let elementAttributeValue = utils_1.HtmlUtils.getAttributeValue(element, attribute.name);
            if (elementAttributeValue === null) {
                return false;
            }
            if (attribute.value !== undefined) {
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
            }
            else if (attribute.regex instanceof RegExp) {
                if (!attribute.regex.test(elementAttributeValue)) {
                    return false;
                }
            }
        }
        return true;
    }
}
exports.ElementSelector = ElementSelector;
