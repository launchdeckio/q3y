const {replace, trim} = require('lodash');

/**
 * Convert request path (e.g. /user/accounts) to object path (e.g. user.accounts)
 * @param {string} path
 */
const convertPath = path => replace(trim(path, '/'), /\//g, '.');

module.exports = convertPath;