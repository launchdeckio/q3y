class NoDataAtPathError extends Error {

    constructor({path, origin}) {
        super(`No data at ${origin}`);
        this.path   = path;
        this.origin = origin;
    }
}

module.exports = NoDataAtPathError;