/**
 * Adopted from `morgan-json` from `indexzero` under MIT.
 * https://github.com/indexzero/morgan-json/
 * Originally adopted from `morgan.compile` from `morgan` under MIT.
 * https://github.com/expressjs/morgan
 */

function isInvalidFormat(format) {
    return !format
      || format === ''
      || (typeof format !== 'object'
          && typeof format !== 'string');
}

/**
 * Take an input string and make it null-safe and URI Encode it.
 * We can then decode in the generated code to get back any special characters the user wanted.
 *
 * This is done to preserve backwards compatibility for the use-cases like `--> /:url`
 *
 *
 * @param input
 * @returns {string} A URL Encoded string
 */

function makeSafe(input) {
    if (!input || !input.trim()) {
        return '';
    }
    return JSON.stringify(
        encodeURIComponent((input).trim()),
    );
}

/**
 * Generate the main code template.
 * This relies on a complex regex (as did the original)
 * This splits the input into the following segments:
 * {prefix}{padding}{token[arguments]}{padding}{postfix}
 *
 * @param format
 * @returns {{}}
 */
function generateBody(format) {
    let fmt = format.replace(/"/g, '\\"');
    fmt = fmt.replace(/'/g, '\\\'');

    const result = {};
    [...fmt.matchAll(
        /([^:]+[^ ])?( +)?:([-\w]{2,})(?:\[([^\]]+)\])?( +)?([^:]+)?/g,
    )].forEach((token) => {
        const prefix = makeSafe(token[1]);
        // Prefix padding is the spaces between a prefix and the actual token
        // Therefore don't call `makeSafe` as that will trim the string
        const prefixPadding = JSON.stringify(token[2]) || '';
        const tokenName = makeSafe(token[3]);
        const arg = makeSafe(token[4]);
        // Postfix padding is the spaces between the actual token and the postfix
        // Therefore don't call `makeSafe` as that will trim the string
        const postfixPadding = JSON.stringify(token[5]) || '';
        const postfix = makeSafe(token[6]);

        let tokenArguments = 'req, res';
        const tokenFunction = `tokens[${tokenName}]`;

        if (arg !== '') {
            tokenArguments += `, ${arg}`;
        }

        result[tokenName] = '';

        if (prefix !== '') {
            result[tokenName] += `decodeURIComponent(${prefix}) +`;
            if (prefixPadding !== '') {
                result[tokenName] += `${prefixPadding} +`;
            }
        }

        result[tokenName] += `( ${tokenFunction}(${tokenArguments}) || "-")`;
        if (postfix !== '') {
            if (postfixPadding !== '') {
                result[tokenName] += `+ ${postfixPadding}`;
            }
            result[tokenName] += `+ decodeURIComponent(${postfix})`;
        }
    });

    return result;
}

function compileString(format, opts) {

    const stringify = opts.stringify !== false ? 'JSON.stringify' : '';


    const body = [];
    const bodyLines = generateBody(format);

    Object.entries(bodyLines).forEach(lines => body.push(lines.join(': ')));

    const js = `
    "use strict"
    return ${stringify} ({
      ${body.join(',\n')}
    })
  `;
    // eslint-disable-next-line no-new-func
    return new Function('tokens, req, res', js);
}

/**
 * Compile an Object with keys as `morgan` format strings into a `morgan` format function
 * that returns JSON. The JSON returned will have the same keys as the format Object.
 *
 * Adopted from `morgan.compile` from `morgan` under MIT.
 *
 * @param {string|Object} format
 * @param {Object} opts Options for how things are returned.
 *   - 'stringify': (default: true) If false returns an object literal
 * @return {function}
 * @public
 */
function compileObject(format, opts) {

    const stringify = opts.stringify !== false ? 'JSON.stringify' : '';

    const body = [];

    Object.entries(format).forEach((entry) => {

        const bodyKey = makeSafe(entry[0]);
        const bodyValue = Object.values(generateBody(entry[1]))
            .join(' + " " + ');

        body.push([bodyKey, bodyValue].join(':'));
    });

    const js = `
    "use strict"
    return ${stringify} ({
      ${body}
    })`;

    // eslint-disable-next-line no-new-func
    return new Function('tokens, req, res', js);
}

/**
 * Compile a `morgan` format string into a `morgan` format function
 * that returns JSON.
 *
 * Adopted from `morgan.compile` from `morgan` under MIT.
 *
 * @param {string|Object} format
 * @param {Object} opts Options for how things are returned.
 *   - 'stringify': (default: true) If false returns an object literal
 * @return {function}
 * @public
 */
export default function compile(format, opts) {
    const options = opts || {};
    if (isInvalidFormat(format)) {
        throw new Error('argument format must be a non-empty string or an object');
    } else if (typeof format === 'string') {
        return compileString(format, options);
    } else {
        return compileObject(format, options);
    }
}
