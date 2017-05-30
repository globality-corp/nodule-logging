'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.logRequests = exports.createLogger = undefined;

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

var _middleware = require('./middleware');

var _middleware2 = _interopRequireDefault(_middleware);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.createLogger = _logger2.default;
exports.logRequests = _middleware2.default;