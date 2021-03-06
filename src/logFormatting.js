import { anyNonNil } from 'is-uuid';
import get from 'lodash/get';
import flatten from 'lodash/flatten';
import isNil from 'lodash/isNil';

export function getElapsedTime(req) {
    const startAt = get(req, '_startAt');
    if (!startAt) {
        return null;
    }
    const diff = process.hrtime(startAt);
    return (diff[0] * 1e3) + (diff[1] * 1e-6);
}

// Get an array of arrays: [[Function-Name, Function-Address]]
// We use config.logging.stackTracePathFilter paths to filter any injected 3rd party packages
// We also filter any lambda expressions
// Note: This function is very simallar to node-stack-trace (https://github.com/felixge/node-stack-trace)
export function getCleanStackTrace(req, parentLevel = 0) {
    const oldLimit = Error.stackTraceLimit;
    Error.stackTraceLimit = 40;
    const stackTrace = Error().stack;
    Error.stackTraceLimit = oldLimit;

    const addresses = get(req, 'app.config.logging.stackTracePathFilter', []).join('|');
    return stackTrace
        .split('\n')
        .slice(1) // the 1st line is a header
        .map(line => line.match(`at ([^ _]+?) .*?((${addresses}).*)\\)`)) // "at funcName (path/leif/src/a/b/c.js:24:16)"
        .filter(res => res !== null)
        .map(matches => matches.slice(1))
        .slice(1 + parentLevel); // we dont want to return getCleanStackTrace
}

function isUuid(property) {
    return typeof property === 'string' && anyNonNil(property);
}

function isUuidList(property) {
    return typeof property === 'string' && property.split(',').every(anyNonNil);
}

// Helper function to parseObject
function validatePropertyType(property, type, recursive) {
    return type && (
        (recursive && typeof property === 'object') ||
        (type === 'string' && typeof property === 'string') ||
        (type === 'number' && typeof property === 'number') ||
        (type === 'uuid' && isUuid(property)) ||
        (type === 'uuidList' && isUuidList(property))
    );
}


// Helper function to extractLoggingProperties
// Parse rules and return an array of properties to log
function parseObject(obj, { name, path, subPaths, type, recursive = true, ...args }) {
    let property = get(obj, path);
    if (property === null || !validatePropertyType(property, type, recursive)) {
        return [];
    }
    if (type === 'uuidList' && isUuidList(property)) {
        return [{ [name]: property.split(',') }];
    }
    if (recursive && typeof property === 'object') {
        const propertyName = isNil(name) ? '' : name;
        const nextPaths = subPaths || Object.keys(property);
        return flatten(nextPaths
            .map(subPath => parseObject(obj, {
                name: `${propertyName}${subPath}`,
                path: `${path}.${subPath}`,
                recursive: false,
                type,
                ...args,
            })));
    }
    if (args.filterPattern) {
        property = typeof property === 'string' ? get(property.match(args.filterPattern), '[1]') : null;
    }
    if (args.hideUUID) {
        property = typeof property === 'string' ? property.replace(
            RegExp('[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}', 'g'),
            '{uuid}',
        ) : null;
    }
    return property === null ? [] : [{ [name]: property }];
}

// Return an object with properties to log
export function extractLoggingProperties(obj, rules) {
    if (!rules) {
        return {};
    }
    const logs = rules.map(rule => parseObject(obj, rule));
    if (!logs.length) {
        return {};
    }
    return Object.assign({}, ...flatten(logs));
}
