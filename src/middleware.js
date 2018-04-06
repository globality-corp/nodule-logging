import { getConfig, getContainer, getMetadata } from '@globality/nodule-config';

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

export default function middleware(req, res, next) {
    const { format } = getConfig('logger.morgan');
    const { level, ignoreRouteUrls } = getConfig('logger');

    const { baseLogger } = getContainer('logger');


    const formatFormat = json(format);
    const options = {
        stream: addStream(baseLogger, level),
        skip: skip(ignoreRouteUrls),
    };
    return morgan(formatFormat, options)(req, res, next);
}

module.exports = {
    skip,
    middleware,
}
