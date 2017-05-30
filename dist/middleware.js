'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.omit = omit;
exports.skip = skip;
exports.addStream = addStream;

var _morgan = require('morgan');

var _morgan2 = _interopRequireDefault(_morgan);

var _morganJson = require('morgan-json');

var _morganJson2 = _interopRequireDefault(_morganJson);

var _omitBy = require('lodash/omitBy');

var _omitBy2 = _interopRequireDefault(_omitBy);

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// filter out named properties from req object
function omit(req, blacklist) {
    return (0, _omitBy2.default)(req, function (value, key) {
        return blacklist.includes(key);
    });
}

// exclude any health or other ignorable urls
function skip(config) {
    return function ignoreUrl(req) {
        var url = req.originalUrl || req.url;
        return config.ignoreRouteUrls.includes(url);
    };
}

// where morgan connects to winston
function addStream(logger, config) {
    return {
        write: function write(message) {
            var logEntry = JSON.parse(message);
            return logger.log(config.level, logEntry.message, logEntry);
        }
    };
}

// uses or creates a winston logger instance
// accepts same config object for consistency

exports.default = function (config) {
    _morgan2.default.token('request-id', function (req) {
        return req.id;
    });
    _morgan2.default.token('request-headers', function (req) {
        var headers = config.includeReqHeaders === true ? omit(req.headers, config.omitReqProperties) : {};
        return JSON.stringify(headers);
    });

    var logger = (0, _logger2.default)(config);
    var format = (0, _morganJson2.default)(config.morgan.format);

    // express middleware to be added BEFORE routes
    return function (app) {
        var options = {
            stream: addStream(logger, config),
            skip: skip(config)
        };

        app.logger = logger; // eslint-disable-line no-param-reassign
        app.use((0, _morgan2.default)(format, options));

        return app;
    };
};