import { clearBinding, getContainer } from '@globality/nodule-config';
import config from '../__mocks__/config';
import {
    addStream,
    createLogger,
    transportConsole,
    transportLoggly,
    omit,
} from '../logger';

describe('create a new logger and transports', () => {
    it.skip('should return a winston logger instance', () => {
        const logger = createLogger(config);
        expect(logger.level).toBe('info');
    });

    it('should return a new console transport', () => {
        const consoleTransport = transportConsole(config.level);
        expect(consoleTransport.level).toBe('info');
        expect(consoleTransport.colorize).toBe(false);
    });

    it('should return a new loggly transport', () => {
        const consoleLoggly = transportLoggly({
            enabled: true,
            token: 'my-loggly-token',
            level: 'info',
            subdomain: 'subdomain',
            tagName: 'service-name',
            environment: 'env',
        });
        expect(consoleLoggly.level).toBe('info');
        expect(consoleLoggly.client.token).toEqual('my-loggly-token');
    });

    it('should skip ignorable routes', () => {
        const req = { authorization: 'xyz' };
        const redacted = omit(req, config.omitReqProperties);
        expect(redacted.authorization).toBe(undefined);
    });

    it('should not fail if graph is not initialized', () => {
        clearBinding('logger');
        const logger = getContainer('logger');
        console.log('logger', logger);
        logger.info('hello there');
    });

    it.skip('should return a writable stream for morgan to write logs to', () => {
        const logger = createLogger(config);
        const stream = addStream(logger, config);
        expect(typeof stream.write).toBe('function');
    });
});
