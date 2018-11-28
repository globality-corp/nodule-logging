import loggly from 'node-loggly-bulk';

class LogglyStream {
    /**
    * copied from: https://www.loggly.com/blog/node-js-libraries-make-sophisticated-logging-simpler/
    * Create a new instance of MorganLogglyLogger
    * @param options {Object}
    * @param options.token {String} your loggly token
    * @param options.subdomain {String} your loggly SUBDOMAIN
    */
    constructor(options) {
        this.client = loggly.createClient({
            token: options.token,
            subdomain: options.subdomain,
            tags: [options.environment, options.name],
            json: true,
        });
    }

    write(message) {
        // XXX add safer handling of string vs obj
        this.client.log(JSON.parse(message));
    }
}

module.exports = LogglyStream;
