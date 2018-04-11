import config from '../__mocks__/config';
import {
    skip,
    omit,
} from '../middleware';


describe('create a new logger middleware', () => {
    it('should skip ignorable routes', () => {
        const { ignoreRouteUrls } = config;
        const ignore = skip(ignoreRouteUrls);
        const req = { originalUrl: '/healthcheck' };
        expect(ignore(req)).toBe(true);
    });

    it('should skip ignorable routes', () => {
        const req = { authorization: 'xyz' };
        const redacted = omit(req, config.omitReqProperties);
        expect(redacted.authorization).toBe(undefined);
    });
});
