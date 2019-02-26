import { bind, setDefaults } from '@globality/nodule-config';
import loggingDefaults from './defaults';
import { extractLoggingProperties, getCleanStackTrace, getElapsedTime } from './logFormatting';
import { getLogger, Logger } from './logger';
import { middleware, setRequestStartAtMiddleware } from './middleware';


bind('logger', () => getLogger());
setDefaults('logger', loggingDefaults());

bind('middleware.logging', () => middleware);
bind('middleware.setRequestStartAt', () => setRequestStartAtMiddleware);

export { Logger, extractLoggingProperties, getCleanStackTrace, getElapsedTime };

