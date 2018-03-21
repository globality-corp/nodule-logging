import {
        transports,
        Logger as WinstonLogger,
    } from 'winston';

import 'winston-loggly'; // adds winston.transports.Loggly
import once from 'lodash/once';
import morgan from 'morgan'; // eslint-disable-line import/no-extraneous-dependencies
import json from 'morgan-json';
import { binding, defaults } from 'nodule-config';
import { get } from 'lodash';
import omitBy from 'lodash/omitBy';

import loggingDefaults from './defaults';
import {
    extractLoggingProperties,
    getCleanStackTrace,
    getElapsedTime,
    getParentFunction,
} from './logFormatting';


function transportLoggly(config) {
    if (config.loggly.enabled === true) {
        return new transports.Loggly({
            handleExceptions: true,
            inputToken: config.loggly.token,
            json: true,
            level: config.level,
            subdomain: config.loggly.subdomain,
            tags: [
                config.loggly.tagName,
                config.loggly.environment,
            ],
        });
    }

    return false;
}


function transportConsole(config) {
    return new transports.Console({
        handleExceptions: true,
        json: true,
        level: config.level,
    });
}

// ES6 uses the order we've inserted the strings
// http://exploringjs.com/es6/ch_oop-besides-classes.html#_traversal-order-of-properties
function sortObj(obj) {
    return Object.keys(obj).sort()
        .filter(key => obj[key] || obj[key] === 0)
        .reduce((acc, key) => ({ ...acc, [key]: obj[key] }), {});
}


// singleton to create a logging instance based on config
function createLogger(config) {
    // winston logger with transports
    const logger = new WinstonLogger({
        exitOnError: false,
        level: config.level,
        transports: [
            transportConsole(config),
            transportLoggly(config),
        ].filter(transport => transport), // remove loggly if falsey
    });

    return logger;
}

// filter out named properties from req object
function omit(req, blacklist) {
    return omitBy(req, (value, key) => blacklist.includes(key));
}

// exclude any health or other ignorable urls
function skip(config) {
    return function ignoreUrl(req) {
        const url = req.originalUrl || req.url;
        return config.ignoreRouteUrls.includes(url);
    };
}

// where morgan connects to winston
function addStream(logger, config) {
    return {
        write: (message) => {
            const logEntry = JSON.parse(message);
            return logger.log(config.level, logEntry.message, logEntry);
        },
    };
}


@binding('logger')
@defaults(loggingDefaults)
class Logger {
    constructor(graph) {
        const config = graph.config.logger;
        const baseLogger = createLogger(config);
        this.baseLogger = baseLogger;
        this.requestRules = config.requestRules;

        // define custom tokens
        morgan.token('operation-hash', req => get(req, 'body.extensions.persistentQuery.sha256Hash'));
        morgan.token('operation-name', req => get(req, 'body.operationName'));
        morgan.token('user-id', req => get(req, 'user.id'));
        morgan.token('message', req => req.name || '-');
        morgan.token('request-id', req => req.id);
        morgan.token('request-headers', (req) => {
            const headers = config.includeReqHeaders === true
                ? omit(req.headers, config.omitReqProperties) : {};
            return JSON.stringify(headers);
        });

        const format = json(config.morgan.format);
        const options = {
            stream: addStream(this.baseLogger, config),
            skip: skip(config),
        };
        graph.app.use(morgan(format, options));
    }

    debug(req, message, args, autoLog = true) {
        const params = this.createLogParameters(req, message, args, autoLog);
        this.baseLogger.debug(message, params);
    }

    info(req, message, args, autoLog = true) {
        const params = this.createLogParameters(req, message, args, autoLog);
        this.baseLogger.info(message, params);
    }

    warning(req, message, args, autoLog = true) {
        const params = this.createLogParameters(req, message, args, autoLog);
        const stackTrace = getCleanStackTrace(req, 1);
        if (stackTrace.length) {
            params.stackTrace = stackTrace;
        }
        this.baseLogger.warn(message, params);
    }

    error(req, message, args, autoLog = true) {
        const params = this.createLogParameters(req, message, args, autoLog);
        const stackTrace = getCleanStackTrace(req, 1);
        if (stackTrace.length) {
            params.stackTrace = stackTrace;
        }
        this.baseLogger.error(message, params);
    }

    createLogParameters(req, message, args, autoLog) {
        const autoParameters = autoLog ? {
            'elapsed-total-ms': getElapsedTime(req),
            ...getParentFunction(req),
            ...extractLoggingProperties(req, this.requestRules),
        } : {};
        return sortObj({ ...autoParameters, ...args, message });
    }
}


module.exports = {
    skip,
    omit,
    Logger,
    createLogger: once(createLogger),
    transportConsole,
    transportLoggly,
};
