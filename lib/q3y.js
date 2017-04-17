'use strict';

const {props} = require('bluebird');

const {
          assign, isFunction, isObject, isArray, split, get, has,
          head, tail, mapValues, isNumber, take, takeRight
      } = require('lodash');

const validatePath = require('./util/validatePath');
const convertPath  = require('./util/convertPath');
const multi        = require('./util/multi');

const NoDataAtPathError = require('./errors/NoDataAtPathError');

/**
 * Default object transformer
 * @param {Object} obj
 * @return {*}
 */
const defaultTransformObject = obj => {

    if (obj instanceof Date) // The resolver is a date, cast to string
        return obj.toISOString();

    if (obj.toJSON && isFunction(obj.toJSON)) { // The resolver has a "toJSON" method, invoke that
        obj                 = obj.toJSON();
        obj.__autoConverted = true;
        return obj;
    }

    return obj;
};

/**
 * Create a function that, given the resolver object or function, resolves the value at the given path
 */
const q3y = (mainResolver, {transformObject = null} = {}) => {

    /**
     * Given the resolver object or function, resolve the value at the given path
     *
     * @param {Function|Object|*} resolver The resolver
     * @param {Object} query The query object
     * @param {Object} [context]
     *
     * @returns {Promise}
     */
    const $ = (resolver, query, context) => {

        if (!has(query, 'path')) throw new Error('Expected the query to contain a path');

        const {path} = query;

        // Track the path that was originally requested, for for debugging purposes
        query.origin = query.origin || path;

        const subQueryFactory = sub => assign({}, query, sub);

        if (isFunction(resolver)) {

            const components = path ? split(path, '.') : [];

            const depth = resolver.depth || 0;
            if (!isNumber(depth)) throw new TypeError(`Resolver depth must be a number, ${typeof depth} given`);

            const key  = take(components, depth);
            const rest = takeRight(components, components.length - depth);

            const subQuery = subQueryFactory({path: key, rest});

            return Promise.resolve(resolver(context, subQuery))

                .then(returnedResolver => $(returnedResolver, subQueryFactory({path: rest.join('.')}), context));
        }

        if (!path) { // We're at the end of the path chain

            if (isObject(resolver) && !resolver.__noResolve && !isArray(resolver)) {

                if (transformObject && !isObject(resolver = transformObject(resolver))) return resolver;

                if (!isObject(resolver = defaultTransformObject(resolver))) return resolver;

                // Resolve all properties of the object
                return props(mapValues(resolver, subResolver => {

                    return $(subResolver, subQueryFactory({path: '', implicit: true}), context);
                }));
            }

            // Return resolver directly if it is not an object or if it specifies __noResolve or when it's an array
            return resolver;

        } else { // We still have path components left, dig into the object

            if (isObject(resolver)) {

                // if sync is an object, dig one level deep
                // use that value as the resolver
                // and the remainder of the current path as the new path

                let restPath = tail(split(path, '.')).join('.');

                let key = head(split(path, '.'));

                if (has(resolver, key))
                    return Promise.resolve($(get(resolver, key), subQueryFactory({path: restPath}), context));
            }

            // The resolver was not an object
            // or did not have a property at the first component of the remaining path
            return Promise.reject(new NoDataAtPathError(query));
        }
    };

    const $main = $.bind(this, mainResolver);

    /**
     * Resolver entry point
     * @param {String} path Request-style ("/user/apps") path
     * @param {Object} context Resolver context
     * @return {Promise}
     */
    const $single = (path, context) => {
        validatePath(path);
        const query = {path: convertPath(path)};
        return $main(query, context);
    };

    const $multi = multi($single);

    $multi.single  = $single;
    $multi.resolve = $main;

    return $multi;
};

module.exports = q3y;