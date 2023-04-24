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
export declare class ElementSelectorSet {
    private selectors;
    constructor(selectors?: string | IElementSelector[]);
    add(selector: IElementSelector): void;
    addFromString(selectorString: string): void;
    anyMatch(element: Element): boolean;
    allMatch(element: Element): boolean;
}
export declare class ElementSelector implements IElementSelector {
    private selector;
    tagName?: string;
    id?: string;
    classNames?: string[];
    attributes?: IElementSelectorAttribute[];
    constructor(selector: IElementSelector);
    matches(element: Element): boolean;
    private tagNameMatches;
    private idMatches;
    private classNamesMatch;
    private attributesMatch;
}
