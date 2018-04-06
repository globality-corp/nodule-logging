import config from '../__mocks__/config';
import {
    skip,
} from '../middleware';


describe('create a new logger middleware', () => {
    it('should skip ignorable routes', () => {
        const { ignoreRouteUrls } = config;
        const ignore = skip(ignoreRouteUrls);
        const req = { originalUrl: '/healthcheck' };
        expect(ignore(req)).toBe(true);
    });
});
