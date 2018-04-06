import { Logger } from './logger';
import { middleware } from './middleware';
import {
    extractLoggingProperties,
    getCleanStackTrace,
    getElapsedTime,
    getParentFunction,
} from './logFormatting';


bind('logger', container => new Logger(container));
setDefaults('logger', loggingDefaults);

bind('middleware.logging', () => middleware);


export {
    Logger,
    extractLoggingProperties,
    getCleanStackTrace,
    getElapsedTime,
    getParentFunction,
};
