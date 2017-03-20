const {get, map, fromPairs, isFunction} = require('lodash');

/**
 * Create a new object where the key is the value returned
 * by the iteratee (or at the given property) of every object
 *
 * @param {Object[]} array
 * @param {String|Function} iteratee
 */
const asKeys = (array, iteratee = 'id') => {

    let propertyIsFunction = isFunction(iteratee);

    return fromPairs(map(array, item => {

        let key = propertyIsFunction ? iteratee(item) : get(item, iteratee);

        return [key, item];
    }));
};

module.exports = asKeys;