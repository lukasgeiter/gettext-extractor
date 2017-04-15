import * as parse5 from 'parse5';
import { ElementSelector, ElementSelectorSet } from '../../src/html/selector';
import { Element } from '../../src/html/parser';

describe('Element Selector', () => {

    describe('matching', () => {

        function createElement(source: string): Element {
            return <Element>(<any>parse5.parse(source)).childNodes[0].childNodes[1].childNodes[0];
        }

        describe('tag name', () => {

            test('normal tag', () => {
                let selector = new ElementSelector({
                    tagName: 'foo'
                });
                expect(selector.matches(createElement('<foo></foo>'))).toBe(true);
                expect(selector.matches(createElement('<foo/>'))).toBe(true);
                expect(selector.matches(createElement('<bar></bar>'))).toBe(false);
                expect(selector.matches(createElement('<bar/>'))).toBe(false);
            });

            test('case-insensitivity', () => {
                let fooSelector = new ElementSelector({
                    tagName: 'foo'
                });
                let barSelector = new ElementSelector({
                    tagName: 'BAR'
                });

                expect(fooSelector.matches(createElement('<FOO></FOO>'))).toBe(true);
                expect(fooSelector.matches(createElement('<foo></foo>'))).toBe(true);
                expect(barSelector.matches(createElement('<BAR></BAR>'))).toBe(true);
                expect(barSelector.matches(createElement('<bar></bar>'))).toBe(true);
            });
        });

        describe('id', () => {

            test('id property', () => {
                let selector = new ElementSelector({
                    id: 'foo'
                });
                expect(selector.matches(createElement('<p id="foo"></p>'))).toBe(true);
                expect(selector.matches(createElement('<p id></p>'))).toBe(false);
                expect(selector.matches(createElement('<p></p>'))).toBe(false);
            });

            test('id attribute', () => {
                let selector = new ElementSelector({
                    attributes: [
                        {
                            name: 'id',
                            value: 'foo'
                        }
                    ]
                });
                expect(selector.matches(createElement('<p id="foo"></p>'))).toBe(true);
                expect(selector.matches(createElement('<p id></p>'))).toBe(false);
                expect(selector.matches(createElement('<p></p>'))).toBe(false);
            });
        });

        describe('class name', () => {

            test('single class', () => {
                let selector = new ElementSelector({
                    classNames: ['foo']
                });

                expect(selector.matches(createElement('<p class="foo"></p>'))).toBe(true);
                expect(selector.matches(createElement('<p></p>'))).toBe(false);
            });

            test('multiple classes', () => {
                let selector = new ElementSelector({
                    classNames: ['foo', 'bar']
                });

                expect(selector.matches(createElement('<p class="foo bar"></p>'))).toBe(true);
                expect(selector.matches(createElement('<p class="foo"></p>'))).toBe(false);
                expect(selector.matches(createElement('<p class="bar"></p>'))).toBe(false);
                expect(selector.matches(createElement('<p></p>'))).toBe(false);
            });
        });

        describe('attribute', () => {

            test('present', () => {
                let selector = new ElementSelector({
                    attributes: [
                        {
                            name: 'foo'
                        }
                    ]
                });

                expect(selector.matches(createElement('<p foo></p>'))).toBe(true);
                expect(selector.matches(createElement('<p></p>'))).toBe(false);
            });

            test('multiple present', () => {
                let selector = new ElementSelector({
                    attributes: [
                        {
                            name: 'foo'
                        },
                        {
                            name: 'bar'
                        }
                    ]
                });

                expect(selector.matches(createElement('<p foo bar></p>'))).toBe(true);
                expect(selector.matches(createElement('<p foo></p>'))).toBe(false);
                expect(selector.matches(createElement('<p bar></p>'))).toBe(false);
                expect(selector.matches(createElement('<p></p>'))).toBe(false);
            });

            test('attribute value', () => {
                let selector = new ElementSelector({
                    attributes: [
                        {
                            name: 'foo',
                            value: 'bar'
                        }
                    ]
                });

                expect(selector.matches(createElement('<p foo="bar"></p>'))).toBe(true);
                expect(selector.matches(createElement('<p foo="baz"></p>'))).toBe(false);
                expect(selector.matches(createElement('<p bar></p>'))).toBe(false);
                expect(selector.matches(createElement('<p></p>'))).toBe(false);
            });

            test('multiple attribute values', () => {
                let selector = new ElementSelector({
                    attributes: [
                        {
                            name: 'foo',
                            value: 'bar'
                        },
                        {
                            name: 'bar',
                            value: 'foo'
                        }
                    ]
                });

                expect(selector.matches(createElement('<p foo="bar" bar="foo"></p>'))).toBe(true);
                expect(selector.matches(createElement('<p foo="bar"></p>'))).toBe(false);
                expect(selector.matches(createElement('<p bar="foo"></p>'))).toBe(false);
                expect(selector.matches(createElement('<p></p>'))).toBe(false);
            });

            test('=', () => {
                let selector = new ElementSelector({
                    attributes: [
                        {
                            name: 'foo',
                            value: 'bar',
                            operator: '='
                        }
                    ]
                });

                expect(selector.matches(createElement('<p foo="bar"></p>'))).toBe(true);
                expect(selector.matches(createElement('<p foo="baz"></p>'))).toBe(false);
                expect(selector.matches(createElement('<p bar></p>'))).toBe(false);
                expect(selector.matches(createElement('<p></p>'))).toBe(false);
            });

            test('^=', () => {
                let selector = new ElementSelector({
                    attributes: [
                        {
                            name: 'foo',
                            value: 'bar',
                            operator: '^='
                        }
                    ]
                });

                expect(selector.matches(createElement('<p foo="bar"></p>'))).toBe(true);
                expect(selector.matches(createElement('<p foo="barfoo"></p>'))).toBe(true);
                expect(selector.matches(createElement('<p foo="foobar"></p>'))).toBe(false);
            });

            test('$=', () => {
                let selector = new ElementSelector({
                    attributes: [
                        {
                            name: 'foo',
                            value: 'bar',
                            operator: '$='
                        }
                    ]
                });

                expect(selector.matches(createElement('<p foo="bar"></p>'))).toBe(true);
                expect(selector.matches(createElement('<p foo="foobar"></p>'))).toBe(true);
                expect(selector.matches(createElement('<p foo="barfoo"></p>'))).toBe(false);
            });

            test('*=', () => {
                let selector = new ElementSelector({
                    attributes: [
                        {
                            name: 'foo',
                            value: 'bar',
                            operator: '*='
                        }
                    ]
                });

                expect(selector.matches(createElement('<p foo="bar"></p>'))).toBe(true);
                expect(selector.matches(createElement('<p foo="foobar"></p>'))).toBe(true);
                expect(selector.matches(createElement('<p foo="barfoo"></p>'))).toBe(true);
                expect(selector.matches(createElement('<p foo="foobarfoo"></p>'))).toBe(true);
            });
        });
    });

    describe('set', () => {

        describe('from string', () => {

            describe('tag name', () => {

                test('normal tag', () => {
                    expect(new ElementSelectorSet('foo')).toEqual(
                        new ElementSelectorSet([{
                            tagName: 'foo'
                        }])
                    );
                });

                test('* tag', () => {
                    expect(new ElementSelectorSet('*')).toEqual(
                        new ElementSelectorSet([{}])
                    );
                });
            });

            describe('id', () => {

                test('#id', () => {
                    expect(new ElementSelectorSet('#foo')).toEqual(
                        new ElementSelectorSet([{
                            id: 'foo'
                        }])
                    );
                });

                test('[id]', () => {
                    expect(new ElementSelectorSet('[id=foo]')).toEqual(
                        new ElementSelectorSet([{
                            attributes: [
                                {
                                    name: 'id',
                                    operator: '=',
                                    value: 'foo'
                                }
                            ]
                        }])
                    );
                });
            });

            describe('class name', () => {

                test('single class', () => {
                    expect(new ElementSelectorSet('.foo')).toEqual(
                        new ElementSelectorSet([{
                            classNames: ['foo']
                        }])
                    );
                });

                test('multiple classes', () => {
                    expect(new ElementSelectorSet('.foo.bar')).toEqual(
                        new ElementSelectorSet([{
                            classNames: ['foo', 'bar']
                        }])
                    );
                });
            });

            describe('attribute', () => {

                describe('present', () => {

                    test('single', () => {
                        expect(new ElementSelectorSet('[foo]')).toEqual(
                            new ElementSelectorSet([{
                                attributes: [
                                    {
                                        name: 'foo'
                                    }
                                ]
                            }])
                        );
                    });

                    test('multiple', () => {
                        expect(new ElementSelectorSet('[foo][bar]')).toEqual(
                            new ElementSelectorSet([{
                                attributes: [
                                    {
                                        name: 'foo'
                                    },
                                    {
                                        name: 'bar'
                                    }
                                ]
                            }])
                        );
                    });
                });

                describe('=', () => {

                    test('without quotes', () => {
                        expect(new ElementSelectorSet('[foo=bar]')).toEqual(
                            new ElementSelectorSet([{
                                attributes: [
                                    {
                                        name: 'foo',
                                        value: 'bar',
                                        operator: '='
                                    }
                                ]
                            }])
                        );
                    });

                    test('with quotes', () => {
                        expect(new ElementSelectorSet('[foo="bar"]')).toEqual(
                            new ElementSelectorSet([{
                                attributes: [
                                    {
                                        name: 'foo',
                                        value: 'bar',
                                        operator: '='
                                    }
                                ]
                            }])
                        );
                    });
                });

                describe('^=', () => {

                    test('without quotes', () => {
                        expect(new ElementSelectorSet('[foo^=bar]')).toEqual(
                            new ElementSelectorSet([{
                                attributes: [
                                    {
                                        name: 'foo',
                                        value: 'bar',
                                        operator: '^='
                                    }
                                ]
                            }])
                        );
                    });

                    test('with quotes', () => {
                        expect(new ElementSelectorSet('[foo^="bar"]')).toEqual(
                            new ElementSelectorSet([{
                                attributes: [
                                    {
                                        name: 'foo',
                                        value: 'bar',
                                        operator: '^='
                                    }
                                ]
                            }])
                        );
                    });
                });

                describe('$=', () => {

                    test('without quotes', () => {
                        expect(new ElementSelectorSet('[foo$=bar]')).toEqual(
                            new ElementSelectorSet([{
                                attributes: [
                                    {
                                        name: 'foo',
                                        value: 'bar',
                                        operator: '$='
                                    }
                                ]
                            }])
                        );
                    });

                    test('with quotes', () => {
                        expect(new ElementSelectorSet('[foo$="bar"]')).toEqual(
                            new ElementSelectorSet([{
                                attributes: [
                                    {
                                        name: 'foo',
                                        value: 'bar',
                                        operator: '$='
                                    }
                                ]
                            }])
                        );
                    });
                });

                describe('*=', () => {

                    test('without quotes', () => {
                        expect(new ElementSelectorSet('[foo*=bar]')).toEqual(
                            new ElementSelectorSet([{
                                attributes: [
                                    {
                                        name: 'foo',
                                        value: 'bar',
                                        operator: '*='
                                    }
                                ]
                            }])
                        );
                    });

                    test('with quotes', () => {
                        expect(new ElementSelectorSet('[foo*="bar"]')).toEqual(
                            new ElementSelectorSet([{
                                attributes: [
                                    {
                                        name: 'foo',
                                        value: 'bar',
                                        operator: '*='
                                    }
                                ]
                            }])
                        );
                    });
                });
            });

            describe('multiple selectors', () => {

                test('standard', () => {
                    expect(new ElementSelectorSet('[foo], [data-foo], .foo')).toEqual(
                        new ElementSelectorSet([
                            {
                                attributes: [
                                    {
                                        name: 'foo'
                                    }
                                ]
                            },
                            {
                                attributes: [
                                    {
                                        name: 'data-foo'
                                    }
                                ]
                            },
                            {
                                classNames: [
                                    'foo'
                                ]
                            }
                        ])
                    );
                });

                test('special', () => {
                    expect(new ElementSelectorSet('span[foo^=bar][bar$=foo], foo.foo.bar, p#foo.bar')).toEqual(
                        new ElementSelectorSet([
                            {
                                tagName: 'span',
                                attributes: [
                                    {
                                        name: 'foo',
                                        operator: '^=',
                                        value: 'bar'
                                    },
                                    {
                                        name: 'bar',
                                        operator: '$=',
                                        value: 'foo'
                                    }
                                ]
                            },
                            {
                                tagName: 'foo',
                                classNames: [
                                    'foo',
                                    'bar'
                                ]
                            },
                            {
                                tagName: 'p',
                                id: 'foo',
                                classNames: [
                                    'bar'
                                ]
                            }
                        ])
                    );
                });
            });

            describe('invalid selectors', () => {

                test('multi-level', () => {
                    expect(() => {
                        new ElementSelectorSet('foo bar');
                    }).toThrowError(`Selector string 'foo bar' is invalid. Multi-level rules are not supported.`);
                });

                test('syntax error', () => {
                    expect(() => {
                        new ElementSelectorSet('foo,,bar');
                    }).toThrowError(`Error parsing selector string`);
                });
            });
        });

        describe('matching', () => {

            let selector1: ElementSelector | any,
                selector2: ElementSelector | any,
                set: ElementSelectorSet;

            beforeEach(() => {
                selector1 = new ElementSelector({});
                selector2 = new ElementSelector({});
                selector1.matches = jest.fn();
                selector2.matches = jest.fn();

                set = new ElementSelectorSet([selector1, selector2]);
            });

            describe('any', () => {

                test('none match', () => {
                    selector1.matches.mockReturnValueOnce(false);
                    selector2.matches.mockReturnValueOnce(false);

                    expect(set.anyMatch(null)).toBe(false);
                });

                test('one matches', () => {
                    selector1.matches.mockReturnValueOnce(false);
                    selector2.matches.mockReturnValueOnce(true);

                    expect(set.anyMatch(null)).toBe(true);
                });

                test('all match', () => {
                    selector1.matches.mockReturnValueOnce(true);
                    selector2.matches.mockReturnValueOnce(true);

                    expect(set.anyMatch(null)).toBe(true);
                });

                test('no selectors', () => {
                    expect(new ElementSelectorSet([]).anyMatch(null)).toBe(false);
                });
            });

            describe('all', () => {

                test('none match', () => {
                    selector1.matches.mockReturnValueOnce(false);
                    selector2.matches.mockReturnValueOnce(false);

                    expect(set.allMatch(null)).toBe(false);
                });

                test('one matches', () => {
                    selector1.matches.mockReturnValueOnce(false);
                    selector2.matches.mockReturnValueOnce(true);

                    expect(set.allMatch(null)).toBe(false);
                });

                test('all match', () => {
                    selector1.matches.mockReturnValueOnce(true);
                    selector2.matches.mockReturnValueOnce(true);

                    expect(set.allMatch(null)).toBe(true);
                });

                test('no selectors', () => {
                    expect(new ElementSelectorSet([]).allMatch(null)).toBe(false);
                });
            });
        });
    });
});
