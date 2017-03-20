const {reduce, split} = require('lodash');

/**
 * Given a path, generate an array of all full parent paths
 * E.g. "/user/account" -> ["/user", "/user/account"]
 *
 * @param {string} path
 * @param {string} [separator = "/"]
 */
const components = (path, separator = '/') => {

    let isPathSep = separator === '/' || separator === '\\';
    let parts     = split(path, separator);

    return reduce(parts, ([partsThusFar, paths], part) => {

        partsThusFar.push(part);
        let nextComponent = partsThusFar.join(separator);
        if (nextComponent === '' && isPathSep) nextComponent = separator;
        paths.push(nextComponent);
        return [partsThusFar, paths];

    }, [[], []])[1];
};

module.exports = components;