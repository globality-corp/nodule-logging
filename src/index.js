import { bind, setDefaults } from '@globality/nodule-config';

import loggingDefaults from './defaults';
import { getLogger, Logger } from './logger';
import { middleware } from './middleware';
import {
    extractLoggingProperties,
    getCleanStackTrace,
    getElapsedTime,
    getParentFunction,
} from './logFormatting';


bind('logger', () => getLogger());
setDefaults('logger', loggingDefaults);

bind('middleware.logging', () => middleware);


export {
    getLogger,
    Logger,
    extractLoggingProperties,
    getCleanStackTrace,
    getElapsedTime,
    getParentFunction,
};
