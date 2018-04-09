import { getConfig, getContainer } from '@globality/nodule-config';
import morgan from 'morgan';
import json from 'morgan-json';
import { get } from 'lodash';
import omitBy from 'lodash/omitBy';

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

export default function middleware(req, res, next) {
    const { level, ignoreRouteUrls, includeReqHeaders, omitReqProperties } = getConfig('logger');
    const { format } = getConfig('logger.morgan');
    // define custom tokens
    morgan.token('operation-hash', request => get(request, 'body.extensions.persistentQuery.sha256Hash'));
    morgan.token('operation-name', request => get(request, 'body.operationName'));
    morgan.token('user-id', request => get(request, 'user.id'));
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

module.exports = {
    omit,
    skip,
    middleware,
};
