import createLogger from '../logger';
import logRequests, { skip, omit, addStream } from '../middleware';
import config from '../__mocks__/config';

describe('return composable express middleware with helper functions', () => {
    it('should return a function with an app param', () => {
        const middleware = logRequests(config);
        expect(typeof middleware).toBe('function');
        expect(/\(app\)/.test(middleware.toString())).toBe(true);
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
        const logger = createLogger(config);
        const stream = addStream(logger, config);
        expect(typeof stream.write).toBe('function');
    });
});
