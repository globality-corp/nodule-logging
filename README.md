# nodule-logging
Opinionated logging for Node projects using Loggly.

Uses Winston and Morgan behind the scenes.

Currently exports an Express middleware to use before your routes.

### Usage
```
//app.js
...
import { logRequests } from 'nodule-logging';
...
const app = express();
const logger = logRequests(config.logging);
app = logger(app);
app.use(routes);
```

Or if you want to compose the app instead...

```
const setup = compose(routes(config), logRequests(config.logging), services, system(config));
const app = setup(express());
```

### Config
Config should must shaped like:
```
{
    loggly: {
        environment: 'dev',
        enabled: true,
        subdomain: 'my-subdomain',
        tagName: 'my-app-name',
        token: 'my-loggly-token',
    },
    name: 'ma-app-name',
    level: 'info',
    ignoreRouteUrls: ['/healthcheck'],
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
    omitReqProperties: ['oldPassword', 'newPassword', 'password'],
}
```
#### TODO:
Add exported middleware to be used in simple `app.use()`.
