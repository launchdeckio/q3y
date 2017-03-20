const {transparent} = require('./../constants');

/**
 * Higher order resolver that makes sure the resolver is only called when the path was specifically requested for
 * (no implicit resolving)
 * @param {Function} fn
 * @return {Function}
 */
const onDemand = () => fn => (_, query) => query.implicit ? transparent : fn;

module.exports = onDemand;