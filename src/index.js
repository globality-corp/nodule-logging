import { bind, setDefaults } from '@globality/nodule-config';

import loggingDefaults from './defaults';
import { getLogger, Logger } from './logger';
import { middleware, setRequestStartAtMiddleware } from './middleware';
import {
    extractLoggingProperties,
    getCleanStackTrace,
    getElapsedTime,
} from './logFormatting';


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
