
import { addConditionExtractor } from './factories/addCondition';

export abstract class RegexExtractors {
    public static addCondition: typeof addConditionExtractor = addConditionExtractor;
}