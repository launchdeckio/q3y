const {get, set, merge, isObject} = require('lodash');

/**
 * Set the given path in the object to value (or merge with existing object if both the value and the property at path are objects)
 * @param object
 * @param path
 * @param value
 */
const mergeOrSet = (object, path, value) => {

    let existing = get(object, path);

    if (existing && isObject(existing) && isObject(value))
        merge(existing, value);

    else set(object, path, value);

    return object;
};

module.exports = mergeOrSet;