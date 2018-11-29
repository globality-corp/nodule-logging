class UnionStream {
    /**
    * Take a list of streams or stream-like objects (objects exposing a write-function)
    * and treat them as one.
    * @param options {Object}
    * @param options.streams {List[Stream]} list of streams to union
    */
    constructor(options) {
        this.streams = options.streams;
    }

    write(message) {
        this.streams.map((stream) => {
            let log;
            if (typeof message === 'object' && !(stream.objectMode)) {
                log = `${JSON.stringify(message)}\n`;
            } else {
                log = message;
            }
            return stream.write(log);
        });
    }
}

module.exports = UnionStream;
