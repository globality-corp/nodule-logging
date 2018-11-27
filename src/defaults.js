export default {
    ignoreRouteUrls: [
        '/api/health',
        '/gql/health',
    ],
    console: {
        colorize: false,
    },
    level: 'info',
    loggly: {
        enabled: false,
        environment: 'dev',
        tagName: 'leif', // xxx set tag name properly
        subdomain: 'globality',
        token: null,
    },
    morgan: {
        format: {
            length: ':res[content-length]',
            // NB: morgan enforces that message is logged even if we omit it here
            message: ':message',
            method: ':method',
            'operation-hash': ':operation-hash',
            'operation-name': ':operation-name',
            'request-id': ':request-id',
            'request-headers': ':request-headers',
            'response-time': ':response-time ms',
            status_code: ':status',
            url: ':url',
            'user-id': ':user-id',
        },
    },
    includeReqHeaders: false,
    hideErrorDetails: false,
    omitReqProperties: [
        'authorization',
        'oldPassword',
        'newPassword',
        'password',
    ],
    slownessWarning: {
        enabled: false,
        warnForServiceResponseTimeMs: 400,
        warnForQueryResponseTimeMs: 1000,
    },
    cache: {
        enabled: false,
    },
    serviceRequestSucceeded: {
        enabled: false,
    },
    // Paths that we want to include in our error stack traces
    // We prefer to filter 3rd party utils and only include leif code
    stackTracePathFilter: [
        '/src/modules/',
        '/src/services/',
        '/src/resolvers/',
        '/app/modules/',
        '/app/services/',
        '/app/resolvers/',
    ],
    // Request parameters to BE services that we should auto log
    backendServiceRequestRules: [
        { path: 'url', name: 'service-url', type: 'string' },
        { path: 'url', name: 'service-ep', type: 'string', hideUUID: true },
        { path: 'method', name: 'service-method', type: 'string' },
        { path: 'params', name: 'service-parameter-', type: 'number', subPaths: ['timestamp', 'offset', 'limit'] },
        { path: 'params', name: 'service-args-', type: 'uuid' },
        { path: 'params', name: 'service-args-', type: 'uuidList' },
        { path: 'params', name: 'service-args-', type: 'number', subPaths: ['timestamp', 'offset', 'limit'] },
        { path: 'data', name: 'service-data-', type: 'uuid' },
        { path: 'data', name: 'service-data-', type: 'uuidList' },
    ],
    // Response parameters to BE services that we should auto log
    backendServiceResponseRules: [
        { path: 'headers.etag', name: 'etag', type: 'string' },
    ],
};
