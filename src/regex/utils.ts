export abstract class RegexUtils {
    public static getLineNumber(fileContent: string, searchString: string): number {
        return fileContent.substring(0, fileContent.indexOf(searchString)).split('\n').length;
    }
}
