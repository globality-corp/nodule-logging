import loggly from 'node-loggly-bulk';

class LogglyStream {
    /**
    * Create a stream-like object to send logs to loggly.
    * Buffering is handled in node-loggly-bulk so wrapping in a node stream is
    * not necessary.
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
        let log;
        if (typeof message !== 'object') {
            log = JSON.parse(message);
        } else {
            log = message;
        }

        this.client.log(log);
    }
}

module.exports = LogglyStream;
