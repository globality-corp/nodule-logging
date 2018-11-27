import { Writable } from 'stream';

class UnionStream extends Writable {
    /**
    * copied from: https://www.loggly.com/blog/node-js-libraries-make-sophisticated-logging-simpler/
    * Create a new instance of MorganLogglyLogger
    * @param options {Object}
    * @param options.streams {List[Stream]} list of streams to union
    */
    constructor(options) {
        // allows use to use any JS object instead of only string or Buffer
        super({ objectMode: true });

        this.streams = options.streams;

        // make sure write function has proper context (this)
        this._write = this._write.bind(this); // eslint-disable-line
    }

    _write(message, encoding, callback) {
        if (typeof message === 'object') {
            this.streams.map(stream => stream.write(JSON.stringify(message), encoding, callback));
        } else {
            this.streams.map(stream => stream.write(message, encoding, callback));
        }
    }
}

module.exports = UnionStream;
