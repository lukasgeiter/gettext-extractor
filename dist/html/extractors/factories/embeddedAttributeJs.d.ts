import { Attribute } from 'parse5';
import { JsParser } from '../../../js/parser';
import { IHtmlExtractorFunction } from '../../parser';
export declare type AttributePredicate = (attribute: Attribute) => boolean;
export declare function embeddedAttributeJsExtractor(filter: RegExp | AttributePredicate, jsParser: JsParser): IHtmlExtractorFunction;
