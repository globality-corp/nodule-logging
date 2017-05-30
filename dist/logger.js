'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.transportLoggly = transportLoggly;
exports.transportConsole = transportConsole;

var _winston = require('winston');

require('winston-loggly');

var _once = require('lodash/once');

var _once2 = _interopRequireDefault(_once);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// set up loggly or not
function transportLoggly(config) {
    if (config.loggly.enabled === true) {
        return new _winston.transports.Loggly({
            handleExceptions: true,
            inputToken: config.loggly.token,
            json: true,
            level: config.level,
            subdomain: config.loggly.subdomain,
            tags: [config.loggly.tagName, config.loggly.environment]
        });
    }

    return false;
} // adds winston.transports.Loggly
function transportConsole(config) {
    return new _winston.transports.Console({
        handleExceptions: true,
        json: true,
        level: config.level
    });
}

// singleton to create a logging instance based on config
exports.default = (0, _once2.default)(function (config) {
    // winston logger with transports
    var logger = new _winston.Logger({
        exitOnError: false,
        level: config.level,
        transports: [transportConsole(config), transportLoggly(config)].filter(function (transport) {
            return transport;
        }) });

    return logger;
});