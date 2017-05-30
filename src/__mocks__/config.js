export default {
    loggly: {
        environment: 'dev',
        enabled: true,
        subdomain: 'my-subdomain',
        tagName: 'styx',
        token: 'my-loggly-token',
    },
    name: 'ma-app-name',
    level: 'info',
    ignoreRouteUrls: ['/api/health', '/healthcheck'],
    console: { colorize: false },
    morgan: {
        format: {
            length: ':res[content-length]',
            message: 'None',
            method: ':method',
            'request-id': ':request-id',
            'request-headers': ':request-headers',
            'response-time': ':response-time ms',
            status_code: ':status',
            url: ':url',
        },
    },
    includeReqHeaders: true,
    omitReqProperties: ['authorization', 'oldPassword', 'newPassword', 'password'],
};
