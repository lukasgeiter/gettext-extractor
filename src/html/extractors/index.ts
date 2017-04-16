import { elementContentExtractor } from './factories/elementContent';

export abstract class HtmlExtractors {
    public static elementContent: typeof elementContentExtractor = elementContentExtractor;
}
