const {map}  = require('lodash');
const arrify = require('arrify');

const mergeOrSet = require('./mergeOrSet');

/**
 * Given the single resolver, generate a function that
 * resolves all requested paths and merges them into a single object
 *
 * @param {Function} $single
 * @returns {Function}
 */
const multi = $single => {

    /**
     * @param {String[]} paths
     * @param {Object} [context]
     * @returns {Promise}
     */
    return (paths, context) => {

        paths = arrify(paths);

        let results = {};

        return Promise.all(map(paths, path => {

            const resultOrPromise = $single(path, context);

            return Promise.resolve(resultOrPromise).then(value => mergeOrSet(results, path, value));

        })).then(() => results);
    };
};

module.exports = multi;