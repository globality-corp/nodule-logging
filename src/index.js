import { bind, setDefaults } from '@globality/nodule-config';

import loggingDefaults from './defaults.js';
import { getLogger, Logger } from './logger.js';
import { middleware, setRequestStartAtMiddleware } from './middleware.js';
import {
    extractLoggingProperties,
    getCleanStackTrace,
    getElapsedTime,
} from './logFormatting.js';


bind('logger', () => getLogger());
setDefaults('logger', loggingDefaults);

bind('middleware.logging', () => middleware);
bind('middleware.setRequestStartAt', () => setRequestStartAtMiddleware);


export {
    Logger,
    extractLoggingProperties,
    getCleanStackTrace,
    getElapsedTime,
};
