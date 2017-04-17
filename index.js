module.exports = require('./lib/q3y');

module.exports.deep     = require('./lib/higherOrder/deep');
module.exports.hub      = require('./lib/higherOrder/hub');
module.exports.onDemand = require('./lib/higherOrder/onDemand');
module.exports.byKey    = require('./lib/higherOrder/byKey');

module.exports.NoDataAtPathError = require('./lib/errors/NoDataAtPathError');

const constants = require('./lib/constants');

module.exports.erase       = constants.erase;
module.exports.transparent = constants.transparent;