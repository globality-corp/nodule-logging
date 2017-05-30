export default {
    name: 'styx',
    ignoreRouteUrls: [
        '/api/health',
        '/healthcheck',
    ],
    console: {
        colorize: false,
    },
    level: 'info',
    loggly: {
        tagName: 'styx',
        enabled: true,
        subdomain: 'globality-test',
        token: 'abcdefghijklmopqrstuvwxyz',
        environment: 'dev',
    },
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
    includeReqHeaders: false,
    omitReqProperties: [
        'authorization',
        'oldPassword',
        'newPassword',
        'password',
    ],
};
