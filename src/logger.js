import { getContainer } from '@globality/nodule-config';
import loggingDefaults from './defaults';
import { extractLoggingProperties, getCleanStackTrace, getElapsedTime } from './logFormatting';
import { LogglyStream, UnionStream } from './streams';


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

const LEVELS = [
    'debug',
    'info',
    'warning',
    'error',
];


class Logger {
    constructor(container) {
        this.config = container.config.logger;
        this.level = this.config.level;
        const { name } = container.metadata;
        this.stream = createLoggerStream(name, this.config.level, this.config.loggly);
        this.requestRules = this.config.requestRules;
    }

    debug(req, message, args, autoLog = true) {
        this.log(req, message, args, 'debug', autoLog);
    }

    info(req, message, args, autoLog = true) {
        this.log(req, message, args, 'info', autoLog);
    }

    warning(req, message, args, autoLog = true) {
        const stackTrace = getCleanStackTrace(req, 1);
        if (stackTrace.length) {
            this.log(req, message, { stackTrace, ...args }, 'warning', autoLog);
        } else {
            this.log(req, message, args, 'warning', autoLog);
        }
    }

    error(req, message, args, autoLog = true) {
        const stackTrace = getCleanStackTrace(req, 1);
        if (stackTrace.length) {
            this.log(req, message, { stackTrace, ...args }, 'error', autoLog);
        } else {
            this.log(req, message, args, 'error', autoLog);
        }
    }

    log(req, message, args, level, autoLog = true) {
        if (LEVELS.indexOf(level) < LEVELS.indexOf(this.level)) {
            // don't log if level not met
            return;
        }

        const params = this.createLogParameters(req, message, args, autoLog, level);
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
            logger: loggingDefaults(),
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
