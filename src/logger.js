import {
        transports,
        Logger,
    } from 'winston';
import 'winston-loggly'; // adds winston.transports.Loggly
import once from 'lodash/once';

// set up loggly or not
export function transportLoggly(config) {
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

export function transportConsole(config) {
    return new transports.Console({
        handleExceptions: true,
        json: true,
        level: config.level,
    });
}

// singleton to create a logging instance based on config
export default once((config) => {
    // winston logger with transports
    const logger = new Logger({
        exitOnError: false,
        level: config.level,
        transports: [
            transportConsole(config),
            transportLoggly(config),
        ].filter(transport => transport), // remove loggly if falsey
    });

    return logger;
});
