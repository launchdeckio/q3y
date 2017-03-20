'use strict';

const {isArray} = require('lodash');

const asKeys = require('./../util/asKeys');

const byKey = (keyName = 'id') => fn => {

    return (context, query) => {

        if (query.path.length) return fn(context, query);

        else return Promise.resolve(fn(context, query)).then(result => {

            return isArray(result) ? asKeys(result, keyName) : result;
        });
    };
};

module.exports = byKey;