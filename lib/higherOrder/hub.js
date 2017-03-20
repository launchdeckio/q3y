const {transparent} = require('./../constants');

/**
 * Higher order resolver that makes sure the resolver is only called when the path was specifically requested for
 * AND a subpath is given
 * (no implicit resolving)
 * @param {Function} fn
 * @return {Function}
 */
const hub = () => fn => (_, query) => (query.implicit || !query.rest.length) ? transparent : fn;

module.exports = hub;