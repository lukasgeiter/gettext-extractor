export function trimIndent(literals: string): string {
    const lines = literals.split('\n');
    const commonIndent = lines.reduce((minIndent: number | undefined, line: string) => {
        const match = line.match(/^(\s*)\S+/);
        if (match !== null) {
            if (minIndent === undefined) {
                return match[1].length;
            } else {
                return Math.min(match[1].length, minIndent);
            }
        }
        return minIndent;
    }, undefined);
    return lines.map(line => line.slice(commonIndent)).join('\n');
}
