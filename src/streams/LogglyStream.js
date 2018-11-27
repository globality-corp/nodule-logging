import { Writable } from 'stream';

import loggly from 'node-loggly-bulk';

class LogglyStream extends Writable {
    /**
    * copied from: https://www.loggly.com/blog/node-js-libraries-make-sophisticated-logging-simpler/
    * Create a new instance of MorganLogglyLogger
    * @param options {Object}
    * @param options.token {String} your loggly token
    * @param options.subdomain {String} your loggly SUBDOMAIN
    */
    constructor(options) {
        // allows use to use any JS object instead of only string or Buffer
        super({ objectMode: true });

        this.client = loggly.createClient({
            token: options.token, // your loggly token
            subdomain: options.subdomain, // your loggly subdomain
            tags: [options.environment, options.name],
            json: true,
        });

        // make sure write function has proper context (this)
        this._write = this._write.bind(this); // eslint-disable-line
    }

    _write(message, encoding, callback) {
        this.client.log(message, (err, { response }) => {
            if (err) return callback(err);

            // pass down the callback function to get err or response from client
            return callback(null, response);
        });
    }
}

module.exports = LogglyStream;
