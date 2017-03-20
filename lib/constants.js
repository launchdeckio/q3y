/**
 * Represents a "transparent" data node i.e. will not override existing data in the state
 * @type {string}
 */
const transparent = '__no_data';

/**
 * Represents an "eraser" data node i.e. the client will remove the value at this path
 * @type {string}
 */
const erase = '__erase';

module.exports = {transparent, erase};