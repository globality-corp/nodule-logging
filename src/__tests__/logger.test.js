import { clearBinding } from '@globality/nodule-config';
import config from '../__mocks__/config';
import {
    createLogger,
    getLogger,
} from '../logger';

describe('create a new logger and transports', () => {
    it.skip('should return a winston logger instance', () => {
        const logger = createLogger(config);
        expect(logger.level).toBe('info');
    });

    it('should not fail if graph is not initialized', () => {
        clearBinding('logger');
        const logger = getLogger();
        logger.info({}, 'hello there');
    });
});
