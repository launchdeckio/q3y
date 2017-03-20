/**
 * Higher order resolver that sets the depth on a resolver
 * @param {Number} depth
 * @return {Function}
 */
const deep = (depth = 0) => fn => {
    fn.depth = depth;
    return fn;
};

module.exports = deep;