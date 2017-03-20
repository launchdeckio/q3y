const {startsWith, isString} = require('lodash');

module.exports = path => {

    if (!isString(path))
        throw new TypeError(`Path should be a string, ${typeof path} given`);

    if (!startsWith(path, '/'))
        throw new Error(`Path should start with "/", ${path} given.`);
};