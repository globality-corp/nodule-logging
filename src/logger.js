import { getContainer } from '@globality/nodule-config';

import {
    extractLoggingProperties,
    getCleanStackTrace,
    getElapsedTime,
} from './logFormatting';
import loggingDefaults from './defaults';
import {
    UnionStream,
    LogglyStream,
} from './streams';


// singleton to create a logging instance based on config
function createLoggerStream(name, level, logglyConfig) {
    const streams = [process.stdout];
    if (logglyConfig.enabled) {
        const logglyStream = new LogglyStream({
            token: logglyConfig.token,
            subdomain: logglyConfig.subdomain,
            name,
            environment: logglyConfig.environment,
        });
        streams.push(logglyStream);
    }
    return new UnionStream({ streams });
}

// ES6 uses the order we've inserted the strings
// http://exploringjs.com/es6/ch_oop-besides-classes.html#_traversal-order-of-properties
function sortObj(obj) {
    return Object.keys(obj).sort()
        .filter(key => obj[key] || obj[key] === 0)
        .reduce((acc, key) => ({ ...acc, [key]: obj[key] }), {});
}


class Logger {
    constructor(container) {
        this.config = container.config.logger;
        const { name } = container.metadata;
        this.stream = createLoggerStream(name, this.config.level, this.config.loggly);
        this.requestRules = this.config.requestRules;
    }

    debug(req, message, args, autoLog = true) {
        const params = this.createLogParameters(req, message, args, autoLog, 'debug');
        this.stream.write(params);
    }

    info(req, message, args, autoLog = true) {
        const params = this.createLogParameters(req, message, args, autoLog, 'info');
        this.stream.write(params);
    }

    warning(req, message, args, autoLog = true) {
        const params = this.createLogParameters(req, message, args, autoLog, 'warning');
        const stackTrace = getCleanStackTrace(req, 1);
        if (stackTrace.length) {
            params.stackTrace = stackTrace;
        }
        this.stream.write(params);
    }

    error(req, message, args, autoLog = true) {
        const params = this.createLogParameters(req, message, args, autoLog, 'error');
        const stackTrace = getCleanStackTrace(req, 1);
        if (stackTrace.length) {
            params.stackTrace = stackTrace;
        }
        this.stream.write(params);
    }

    createLogParameters(req, message, args, autoLog, level) {
        const autoParameters = autoLog ? {
            elapsedTotalMs: getElapsedTime(req),
            ...extractLoggingProperties(req, this.requestRules),
        } : {};
        return sortObj({ ...autoParameters, ...args, message, level });
    }
}

function getLogger() {
    const { metadata, config } = getContainer();
    const defaults = {
        metadata: {
            name: 'testing',
        },
        config: {
            logger: loggingDefaults,
        },
    };

    if (!config && !metadata) {
        return new Logger(defaults);
    }

    if (metadata.testing) {
        return new Logger(defaults);
    }

    const container = getContainer();
    return new Logger(container);
}


module.exports = {
    getLogger,
    Logger,
};
