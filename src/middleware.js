import morgan from 'morgan';
import json from 'morgan-json';
import omitBy from 'lodash/omitBy';
import createLogger from './logger';

// filter out named properties from req object
export function omit(req, blacklist) {
    return omitBy(req, (value, key) => blacklist.includes(key));
}

// exclude any health or other ignorable urls
export function skip(config) {
    return function ignoreUrl(req) {
        const url = req.originalUrl || req.url;
        return config.ignoreRouteUrls.includes(url);
    };
}

// where morgan connects to winston
export function addStream(logger, config) {
    return {
        write: (message) => {
            const logEntry = JSON.parse(message);
            return logger.log(config.level, logEntry.message, logEntry);
        },
    };
}

// uses or creates a winston logger instance
// accepts same config object for consistency
export default (config) => {
    morgan.token('request-id', req => req.id);
    morgan.token('request-headers', (req) => {
        const headers = config.includeReqHeaders === true
            ? omit(req.headers, config.omitReqProperties) : {};
        return JSON.stringify(headers);
    });

    const logger = createLogger(config);
    const format = json(config.morgan.format);

    // express middleware to be added BEFORE routes
    return (app) => {
        const options = {
            stream: addStream(logger, config),
            skip: skip(config),
        };

        app.logger = logger; // eslint-disable-line no-param-reassign
        app.use(morgan(format, options));

        return app;
    };
};
