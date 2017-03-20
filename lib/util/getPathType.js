const {startsWith} = require('lodash');

const PATH_TYPE_REQUEST = Symbol('PATH_TYPE_REQUEST');
const PATH_TYPE_OBJECT  = Symbol('PATH_TYPE_OBJECT');

/**
 * Guess the type of the given path (either object "user.apps" or request "/user/apps")
 * @param path
 * @param def
 * @return {*}
 */
const getPathType = (path, def = null) => {

    if (!path) return def;

    if (startsWith(path, '/')) return PATH_TYPE_REQUEST;
    if (startsWith(path, '.')) return PATH_TYPE_OBJECT;

    const numSlashes = (path.match(/\//g) || []).length;
    const numDots    = (path.match(/\./g) || []).length;

    if (numSlashes > numDots) return PATH_TYPE_REQUEST;
    if (numDots > numSlashes) return PATH_TYPE_OBJECT;

    return def;
};

getPathType.PATH_TYPE_REQUEST = PATH_TYPE_REQUEST;
getPathType.PATH_TYPE_OBJECT  = PATH_TYPE_OBJECT;

module.exports = getPathType;