/**
 * Adopted from `morgan-json` from `indexzero` under MIT.
 * https://github.com/indexzero/morgan-json/
 * Originally adopted from `morgan.compile` from `morgan` under MIT.
 * https://github.com/expressjs/morgan
 */

import compile from '../morganJson';

//
// A simple mock "morgan" object which returns deterministic
// output from the defined functions.
//
const mock = {
    method() {
        return 'method';
    },
    url() {
        return 'url';
    },
    status() {
        return 'status';
    },
    res(req, res, arg) {
        return ['res', arg].join(' ');
    },
    'response-time': () => 'response-time',
    ctf() {
        return '}) + global.CTF() + {(';
    },
};

//
// Invalid argument message that morgan-json outputs.
//
const invalidMsg = 'argument format must be a non-empty string or an object';

describe('morgan-json', () => {
    it('format string of all tokens', () => {
        const compiled = compile(
            ':method :url :status :res[content-length] :response-time',
        );
        const output = compiled(mock);

        expect(output)
            .toStrictEqual(JSON.stringify({
                method: 'method',
                url: 'url',
                status: 'status',
                res: 'res content-length',
                'response-time': 'response-time',
            }));
    });

    it('format string of all tokens (with trailers)', () => {
        const compiled = compile(
            ':method :url :status :res[content-length] bytes :response-time ms',
        );
        const output = compiled(mock);

        expect(output)
            .toStrictEqual(JSON.stringify({
                method: 'method',
                url: 'url',
                status: 'status',
                res: 'res content-length bytes',
                'response-time': 'response-time ms',
            }));
    });

    it('format object of all single tokens (no trailers)', () => {
        const compiled = compile({
            method: ':method',
            url: ':url',
            status: ':status',
            'response-time': ':response-time',
            length: ':res[content-length]',
        });

        const output = compiled(mock);
        expect(output)
            .toStrictEqual(JSON.stringify({
                method: 'method',
                url: 'url',
                status: 'status',
                'response-time': 'response-time',
                length: 'res content-length',
            }));
    });

    it('format object with multiple tokens', () => {
        const compiled = compile({
            short: ':method :url :status',
            'response-time': ':response-time',
            length: ':res[content-length]',
        });

        const output = compiled(mock);
        expect(output)
            .toStrictEqual(JSON.stringify({
                short: 'method url status',
                'response-time': 'response-time',
                length: 'res content-length',
            }));
    });

    it('format object of all tokens (with prefix & postfix)', () => {
        const compiled = compile({
            method: 'GET :method',
            url: '-> /:url',
            status: 'Code :status',
            'response-time': ':response-time ms',
            length: ':res[content-length]',
        });

        const output = compiled(mock);
        expect(output)
            .toStrictEqual(JSON.stringify({
                method: 'GET method',
                url: '-> /url',
                status: 'Code status',
                'response-time': 'response-time ms',
                length: 'res content-length',
            }));
    });

    describe('{ stringify: false }', () => {
        it('format object returns an object', () => {
            const compiled = compile({
                short: ':method :url :status',
                'response-time': ':response-time',
                length: ':res[content-length]',
            }, { stringify: false });

            const output = compiled(mock);
            expect(typeof output)
                .toEqual('object');
            expect(output)
                .toStrictEqual({
                    short: 'method url status',
                    'response-time': 'response-time',
                    length: 'res content-length',
                });
        });

        it('format string returns an object', () => {
            const compiled = compile(':method :url :status', { stringify: false });

            const output = compiled(mock);

            expect(typeof output)
                .toEqual('object');
            expect(output)
                .toStrictEqual({
                    method: 'method',
                    url: 'url',
                    status: 'status',
                });
        });
    });

    describe('Invalid arguments', () => {
        it('throws with null', () => {
            expect(() => {
                compile(null, {});
            })
                .toThrow(invalidMsg);
        });

        it('throws with Boolean', () => {
            expect(() => {
                compile(false, {});
            })
                .toThrow(invalidMsg);
            expect(() => {
                compile(true, {});
            })
                .toThrow(invalidMsg);
        });

        it('throws with Number', () => {
            expect(() => {
                compile(0, {});
            })
                .toThrow(invalidMsg);
            expect(() => {
                compile(1, {});
            })
                .toThrow(invalidMsg);
            expect(() => {
                compile(Number.MAX_VALUE, {});
            })
                .toThrow(invalidMsg);
            expect(() => {
                compile(Number.POSITIVE_INFINITY, {});
            })
                .toThrow(invalidMsg);
        });

        it('throws with empty string', () => {
            expect(() => {
                compile('', {});
            })
                .toThrow(invalidMsg);
        });

    });

    const cveData = [
        {
            name: 'Format object with unsafe token name',
            format: {
                short: ':method :url :status',
                'response-time': ':response-time',
                length: ':res})+ global.CTF() + ({[content-length] trailer"',
            },
            expected: JSON.stringify({
                short: 'method url status',
                'response-time': 'response-time',
                // eslint-disable-next-line no-useless-escape
                length: 'res })+ global.CTF() + ({[content-length] trailer\\\"',
            }),
        },
        {
            name: 'Format string with unsafe token name',
            format: ':res})+ global.CTF() + ({[content-length] trailer',
            expected: JSON.stringify({
                res: 'res })+ global.CTF() + ({[content-length] trailer',
            }),
        },
        {
            name: 'Format string with unsafe arg',
            format: ':res[})+ global.CTF() + ({] trailer',
            expected: JSON.stringify({
                res: 'res %7D)%2B%20global.CTF()%20%2B%20(%7B trailer',
            }),
        },
        {
            name: 'Format string with unsafe prefix',
            format: '})+ global.CTF() + ({ :res[content-length] trailer',
            expected: JSON.stringify({
                res: '})+ global.CTF() + ({ res content-length trailer',
            }),
        },
        {
            name: 'Mock contains remote code attack',
            format: ':ctf',
            expected: JSON.stringify({ ctf: '}) + global.CTF() + {(' }),
        },
    ];

    function runTest(testcase) {
        const { format, expected } = testcase;

        let pass = true;

        global.CTF = () => {
            pass = false;
        };

        const compiled = compile(format, {});

        const actual = compiled(mock);

        expect(pass)
            .toBe(true);

        // We won't actually fetch the key as the code injection would trigger 1st
        expect(actual)
            .toStrictEqual(expected);
    }

    describe('CVE-2022-25921', () => {
        // Based on the POC taken from
        // https://security.snyk.io/vuln/SNYK-JS-MORGANJSON-2976193
        cveData.forEach((testcase) => {
            it(testcase.name, () => runTest(testcase));
        });
    });
});

