class NoDataAtPathError extends Error {

    constructor({path, origin}) {
        super(`No data at ${path} (original query: ${origin})`);
        this.path = path;
    }
}

module.exports = NoDataAtPathError;