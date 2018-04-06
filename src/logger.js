import {
    transports,
    Logger as WinstonLogger,
} from 'winston';

import 'winston-loggly'; // adds winston.transports.Loggly
import morgan from 'morgan'; // eslint-disable-line import/no-extraneous-dependencies
import json from 'morgan-json';
import { bind, setDefaults } from '@globality/nodule-config';
import { get } from 'lodash';
import omitBy from 'lodash/omitBy';

import loggingDefaults from './defaults';
import {
    extractLoggingProperties,
    getCleanStackTrace,
    getElapsedTime,
    getParentFunction,
} from './logFormatting';


function transportLoggly({
    enabled,
    token,
    level,
    subdomain,
    tagName,
    environment,
}) {
    if (enabled === true) {
        return new transports.Loggly({
            subdomain,
            level,
            handleExceptions: true,
            inputToken: token,
            json: true,
            tags: [
                tagName,
                environment,
            ],
        });
    }

    return false;
}


// singleton to create a logging instance based on config
function createLogger(container) {
    const { metadata, config } = container;
    const { logger: loggingConfig } = config;
    // winston logger with transports
    const logger = new WinstonLogger({
        exitOnError: false,
        level: loggingConfig.level,
        transports: [
            transportConsole(loggingConfig.level),
            transportLoggly({
                enabled: loggingConfig.loggly.enabled,
                environment: loggingConfig.loggly.environment,
                subdomain: loggingConfig.loggly.subdomain,
                token: loggingConfig.loggly.token,
                tagName: metadata.name,
                level: loggingConfig.level,
            }),
        ].filter(transport => transport), // remove loggly if falsey
    });

    return logger;
}


function transportConsole(level) {
    return new transports.Console({
        level,
        handleExceptions: true,
        json: true,
    });
}


// ES6 uses the order we've inserted the strings
// http://exploringjs.com/es6/ch_oop-besides-classes.html#_traversal-order-of-properties
function sortObj(obj) {
    return Object.keys(obj).sort()
        .filter(key => obj[key] || obj[key] === 0)
        .reduce((acc, key) => ({ ...acc, [key]: obj[key] }), {});
}

// filter out named properties from req object
function omit(req, blacklist) {
    return omitBy(req, (value, key) => blacklist.includes(key));
}

class Logger {
    constructor(container) {
        this.config = container.config.logger;
        this.baseLogger = createLogger(container);
        this.requestRules = this.config.requestRules;

        // define custom tokens
        morgan.token('operation-hash', req => get(req, 'body.extensions.persistentQuery.sha256Hash'));
        morgan.token('operation-name', req => get(req, 'body.operationName'));
        morgan.token('user-id', req => get(req, 'user.id'));
        morgan.token('message', req => req.name || '-');
        morgan.token('request-id', req => req.id);
        morgan.token('request-headers', (req) => {
            const headers = this.config.includeReqHeaders === true
                ? omit(req.headers, this.config.omitReqProperties) : {};
            return JSON.stringify(headers);
        });
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
    omit,
    Logger,
    transportConsole,
    transportLoggly,
};
