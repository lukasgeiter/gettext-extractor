import { IContentOptions, normalizeContent } from '../../src/utils/content';

describe('Content Utils', () => {

    describe('normalizeContent', () => {

        type Scenario = 'default' | 'noTrim' | 'preserveIndentation' | 'noTrimPreserveIndentation' | 'replaceNewlinesCRLF' | 'replaceNewlinesCRLFPreserveIndentation';

        const scenarios: {[scenario in Scenario]: IContentOptions} = {
            default: {
                preserveIndentation: false,
                replaceNewLines: false,
                trimWhiteSpace: true
            },
            noTrim: {
                preserveIndentation: false,
                replaceNewLines: false,
                trimWhiteSpace: false
            },
            preserveIndentation: {
                preserveIndentation: true,
                replaceNewLines: false,
                trimWhiteSpace: true
            },
            noTrimPreserveIndentation: {
                preserveIndentation: true,
                replaceNewLines: false,
                trimWhiteSpace: false
            },
            replaceNewlinesCRLF: {
                preserveIndentation: false,
                replaceNewLines: '\r\n',
                trimWhiteSpace: true
            },
            replaceNewlinesCRLFPreserveIndentation: {
                preserveIndentation: true,
                replaceNewLines: '\r\n',
                trimWhiteSpace: true
            }
        };

        function registerNormalizeContentTests(newLine: string, whitespace: string): void {

            function testCase(summary: string, source: string, expectedResults: { [scenario in Scenario]: string }): void {
                const whitespacePlaceholder = / {4}/g;
                source = source.replace(/\n/g, newLine).replace(whitespacePlaceholder, whitespace);

                describe(summary, () => {
                    for (let scenario of Object.keys(scenarios)) {
                        test(scenario, () => {
                            expect(normalizeContent(source, scenarios[scenario]))
                                .toBe(expectedResults[scenario].replace(whitespacePlaceholder, whitespace));
                        });
                    }
                });
            }

            testCase('single line',
                'Foo Bar',
                {
                    default:
                        'Foo Bar',
                    noTrim:
                        'Foo Bar',
                    preserveIndentation:
                        'Foo Bar',
                    noTrimPreserveIndentation:
                        'Foo Bar',
                    replaceNewlinesCRLF:
                        'Foo Bar',
                    replaceNewlinesCRLFPreserveIndentation:
                        'Foo Bar'
                }
            );

            testCase('leading and trailing newline',
                '\n' +
                'Foo Bar\n',
                {
                    default:
                        'Foo Bar',
                    noTrim:
                        '\n' +
                        'Foo Bar\n',
                    preserveIndentation:
                        'Foo Bar',
                    noTrimPreserveIndentation:
                        '\n' +
                        'Foo Bar\n',
                    replaceNewlinesCRLF:
                        'Foo Bar',
                    replaceNewlinesCRLFPreserveIndentation:
                        'Foo Bar'
                }
            );

            testCase('leading and trailing newline with indentation',
                '\n' +
                '    Foo Bar\n',
                {
                    default:
                        'Foo Bar',
                    noTrim:
                        '\n' +
                        'Foo Bar\n',
                    preserveIndentation:
                        '    Foo Bar',
                    noTrimPreserveIndentation:
                        '\n' +
                        '    Foo Bar\n',
                    replaceNewlinesCRLF:
                        'Foo Bar',
                    replaceNewlinesCRLFPreserveIndentation:
                        '    Foo Bar'
                }
            );

            testCase('indented leading newline',
                '    \n' +
                '    Foo Bar\n',
                {
                    default:
                        'Foo Bar',
                    noTrim:
                        '\n' +
                        'Foo Bar\n',
                    preserveIndentation:
                        '    Foo Bar',
                    noTrimPreserveIndentation:
                        '    \n' +
                        '    Foo Bar\n',
                    replaceNewlinesCRLF:
                        'Foo Bar',
                    replaceNewlinesCRLFPreserveIndentation:
                        '    Foo Bar'
                }
            );

            testCase('multiple leading newlines',
                '\n' +
                '\n' +
                'Foo Bar',
                {
                    default:
                        'Foo Bar',
                    noTrim:
                        '\n' +
                        '\n' +
                        'Foo Bar',
                    preserveIndentation:
                        'Foo Bar',
                    noTrimPreserveIndentation:
                        '\n' +
                        '\n' +
                        'Foo Bar',
                    replaceNewlinesCRLF:
                        'Foo Bar',
                    replaceNewlinesCRLFPreserveIndentation:
                        'Foo Bar'
                }
            );

            testCase('multiple trailing newlines',
                'Foo Bar\n' +
                '\n',
                {
                    default:
                        'Foo Bar',
                    noTrim:
                        'Foo Bar\n' +
                        '\n',
                    preserveIndentation:
                        'Foo Bar',
                    noTrimPreserveIndentation:
                        'Foo Bar\n' +
                        '\n',
                    replaceNewlinesCRLF:
                        'Foo Bar',
                    replaceNewlinesCRLFPreserveIndentation:
                        'Foo Bar'
                }
            );

            testCase('multiple content lines',
                '\n' +
                'Foo\n' +
                'Bar\n',
                {
                    default:
                        'Foo\n' +
                        'Bar',
                    noTrim:
                        '\n' +
                        'Foo\n' +
                        'Bar\n',
                    preserveIndentation:
                        'Foo\n' +
                        'Bar',
                    noTrimPreserveIndentation:
                        '\n' +
                        'Foo\n' +
                        'Bar\n',
                    replaceNewlinesCRLF:
                        'Foo\r\n' +
                        'Bar',
                    replaceNewlinesCRLFPreserveIndentation:
                        'Foo\r\n' +
                        'Bar'
                }
            );

            testCase('multiple content lines with indentation',
                '\n' +
                '    Foo\n' +
                '    Bar\n',
                {
                    default:
                        'Foo\n' +
                        'Bar',
                    noTrim:
                        '\n' +
                        'Foo\n' +
                        'Bar\n',
                    preserveIndentation:
                        '    Foo\n' +
                        '    Bar',
                    noTrimPreserveIndentation:
                        '\n' +
                        '    Foo\n' +
                        '    Bar\n',
                    replaceNewlinesCRLF:
                        'Foo\r\n' +
                        'Bar',
                    replaceNewlinesCRLFPreserveIndentation:
                        '    Foo\r\n' +
                        '    Bar'
                }
            );
        }

        describe('LF & spaces', () => {

            registerNormalizeContentTests('\n', '    ');
        });

        describe('LF & tabs', () => {

            registerNormalizeContentTests('\n', '\t');
        });

        describe('CRLF & spaces', () => {

            registerNormalizeContentTests('\r\n', '    ');
        });

        describe('CRLF & tabs', () => {

            registerNormalizeContentTests('\r\n', '\t');
        });
    });
});
