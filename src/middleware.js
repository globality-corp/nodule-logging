import { getConfig, getContainer } from '@globality/nodule-config';
import get from 'lodash/get';
import omitBy from 'lodash/omitBy';
import set from 'lodash/set';
import morgan from 'morgan';
import json from 'morgan-json';
import onFinished from 'on-finished';
import onHeaders from 'on-headers';

// where morgan connects to winston
function addStream(logger, level) {
    return {
        write: (message) => {
            const logEntry = JSON.parse(message);
            return logger.log(level, logEntry.message, logEntry);
        },
    };
}


// exclude any health or other ignorable urls
function skip(ignoreRouteUrls) {
    return function ignoreUrl(req) {
        const url = req.originalUrl || req.url;
        return ignoreRouteUrls.includes(url);
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
    const { level, ignoreRouteUrls, includeReqHeaders, omitReqProperties } = getConfig('logger');
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

    const { baseLogger } = getContainer('logger');
    const formatFormat = json(format);
    const options = {
        stream: addStream(baseLogger, level),
        skip: skip(ignoreRouteUrls),
    };
    return morgan(formatFormat, options)(req, res, next);
}


function thinMiddleware(req, res, next) {
    const { logger } = getContainer();
    recordStartTime(req);

    function logOnRequestStart () {
        logger.info(req, 'OperationStarted', {});
    }
    function logOnRequestEnd () {
        logger.info(req, 'OperationEnded', { statusCode: get(res, 'statusCode', 0) });
    }
    onHeaders(res, logOnRequestStart);
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
