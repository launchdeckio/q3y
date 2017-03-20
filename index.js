module.exports = require('./lib/qrry');

module.exports.deep     = require('./lib/higherOrder/deep');
module.exports.hub      = require('./lib/higherOrder/hub');
module.exports.onDemand = require('./lib/higherOrder/onDemand');
module.exports.byKey    = require('./lib/higherOrder/byKey');