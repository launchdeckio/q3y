'use strict';

let loadPath = __dirname + '/../../.env';
require('dotenv').config({path: loadPath});

const chai           = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

module.exports = chai.expect;