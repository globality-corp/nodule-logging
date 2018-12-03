import { clearBinding } from '@globality/nodule-config';
import {
    getLogger,
} from '../logger';

describe('create a new logger and transports', () => {
    it('should not fail if graph is not initialized', () => {
        clearBinding('logger');
        const logger = getLogger();
        expect(logger.level).toBe('info');
        logger.info({}, 'hello there');
    });

    it('should respect log level', () => {
        clearBinding('logger');
        const logger = getLogger();
        logger.stream.write = jest.fn();
        logger.info({}, 'hello there');
        expect(logger.stream.write.mock.calls.length).toBe(1);
        // debug logs are not created
        logger.debug({}, 'hello there');
        expect(logger.stream.write.mock.calls.length).toBe(1);
        // but warning logs
        logger.warning({}, 'hello there');
        expect(logger.stream.write.mock.calls.length).toBe(2);
    });
});
