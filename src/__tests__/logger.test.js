import config from '../__mocks__/config';
import createLogger, { transportConsole, transportLoggly } from '../logger';

describe('create a new logger and transports', () => {
    it('should return a winston logger instance', () => {
        const logger = createLogger(config);
        expect(logger.level).toBe('info');
    });

    it('should return a new console transport', () => {
        const consoleTransport = transportConsole(config);
        expect(consoleTransport.level).toBe('info');
        expect(consoleTransport.colorize).toBe(false);
    });

    it('should return a new loggly transport', () => {
        const consoleLoggly = transportLoggly(config);
        expect(consoleLoggly.level).toBe('info');
        expect(consoleLoggly.client.token).toEqual('my-loggly-token');
    });
});
