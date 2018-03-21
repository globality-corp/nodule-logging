import config from '../__mocks__/config';
import { transportConsole, transportLoggly, skip, omit } from '../logger';

describe('create a new logger and transports', () => {
    it('should return a winston logger instance', () => {
        // xxx good oprotunity to try writing more graph oriented tests
        // const logger = createLogger(config);
        // expect(logger.level).toBe('info');
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

    it('should skip ignorable routes', () => {
        const ignore = skip(config);
        const req = { originalUrl: '/healthcheck' };
        expect(ignore(req)).toBe(true);
    });

    it('should skip ignorable routes', () => {
        const req = { authorization: 'xyz' };
        const redacted = omit(req, config.omitReqProperties);
        expect(redacted.authorization).toBe(undefined);
    });

    it('should return a writable stream for morgan to write logs to', () => {
        // xxx good oprotunity to try writing more graph oriented tests
        // const logger = createLogger(config);
        // const stream = addStream(logger, config);
        // expect(typeof stream.write).toBe('function');
    });
});
