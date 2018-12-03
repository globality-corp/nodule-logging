import { getConfig, getContainer } from '@globality/nodule-config';
import morgan from 'morgan';
import json from 'morgan-json';
import onFinished from 'on-finished';
import { get, set } from 'lodash';
import omitBy from 'lodash/omitBy';

// exclude any health or other ignorable urls
function skip(ignoreRouteUrls) {
    return function ignoreUrl(req) {
        const url = req.originalUrl || req.url;
        return ignoreRouteUrls.includes(url);
    };
}

function asStream(logger) {
    return {
        // XXX add safer handling of string vs obj
        write: (message) => {
            const log = JSON.parse(message);
            logger.info({}, log.message, log);
        },
    };
}


// filter out named properties from req object
function omit(req, blacklist) {
    return omitBy(req, (value, key) => blacklist.includes(key));
}


function recordStartTime(req) {
    set(req, '_startAt', process.hrtime());
}


// Use morgan library to log every HTTP response
// Also set req._startAt - that is used by the logger
function morganMiddleware(req, res, next) {
    const { ignoreRouteUrls, includeReqHeaders, omitReqProperties } = getConfig('logger');
    const { format } = getConfig('logger.morgan');
    // define custom tokens
    morgan.token('operation-hash', request => get(request, 'body.extensions.persistentQuery.sha256Hash'));
    morgan.token('operation-name', request => get(request, 'body.operationName'));
    morgan.token('user-id', request => get(request, 'locals.user.id'));
    morgan.token('company-id', request => get(request, 'locals.user.companyId'));
    morgan.token('message', request => request.name || '-');
    morgan.token('request-id', request => request.id);
    morgan.token('request-headers', (request) => {
        const headers = includeReqHeaders === true
            ? omit(request.headers, omitReqProperties) : {};
        return JSON.stringify(headers);
    });

    const logger = getContainer('logger');
    const formatFormat = json(format);
    const options = {
        stream: asStream(logger),
        skip: skip(ignoreRouteUrls),
    };
    return morgan(formatFormat, options)(req, res, next);
}


function thinMiddleware(req, res, next) {
    const { logger } = getContainer();
    recordStartTime(req);

    function logOnRequestEnd () {
        logger.info(req, 'OperationEnded', { statusCode: get(res, 'statusCode', 0) });
    }
    onFinished(res, logOnRequestEnd);
    next();
}


export default function middleware(req, res, next) {
    const { enableMorgan } = getConfig('logger');
    if (enableMorgan) {
        morganMiddleware(req, res, next);
    } else {
        thinMiddleware(req, res, next);
    }
}


// Set req._startAt - that is used by the logger
// Should be used if logging.middleware (morgan based) is not set
export function setRequestStartAtMiddleware(req, res, next) {
    recordStartTime(req);
    return next();
}


module.exports = {
    middleware,
    omit,
    setRequestStartAtMiddleware,
    skip,
};
