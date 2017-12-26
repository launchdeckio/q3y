const {replace, trim} = require('lodash');

/**
 * Convert request path (e.g. /user/accounts) to object path (e.g. user.accounts)
 * @param {string} path
 * @param {string} separator Object path separator ("." by default)
 */
const convertPath = (path, separator = '.') => replace(trim(path, '/'), /\//g, separator);

module.exports = convertPath;