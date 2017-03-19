'use strict';

const bluebird = require('bluebird');

const {
          assign, isFunction, isObject, isArray, split, reduce, get, set, has, merge,
          head, tail, map, replace, trim, startsWith, mapValues, isNumber, take, takeRight
      } = require('lodash');

const isObjectID = require('./../common/isObjectID');

class NoDataAtPathError extends Error {

    constructor({path, origin}) {
        super(`No data at ${path} (original query: ${origin})`);
        this.path = path;
    }
}

/**
 * Split a path into its "parent components"
 * E.g. "/user/account" -> ["/user", "/user/account"]
 *
 * @param {string} path
 * @param {string} [separator = "/"]
 */
const components = (path, separator = '/') => {

    let isPathSep = separator === '/' || separator === '\\';
    let parts     = split(path, separator);

    return reduce(parts, ([partsThusFar, paths], part) => {

        partsThusFar.push(part);
        let nextComponent = partsThusFar.join(separator);
        if (nextComponent === '' && isPathSep) nextComponent = separator;
        paths.push(nextComponent);
        return [partsThusFar, paths];

    }, [[], []])[1];
};

/**
 * Determine if the given object should be cast to string rather than traversed
 * @param obj
 * @returns {boolean|*}
 */
const isPrimitiveObject = obj => {

    return isObjectID(obj);
};

/**
 * Given the base query, returns a function that will generate a subquery with the additional properties
 * @param query
 */
const subQueryFactory = query => subQuery => assign({}, query, subQuery);

/**
 * Given the resolver object or function, resolve the value at the given path
 *
 * @param {Function|Object|*} resolver The resolver
 * @param {Object} query The location context
 * @param {Object} [context]
 *
 * @returns {Promise}
 */
const resolve = (resolver, query, context) => {

    if (!has(query, 'path')) throw new Error('Expected the query to contain a path');

    const {path} = query;

    // Track the path that was originally requested for for debugging purposes
    query.origin = query.origin || path;

    const subQuery = subQueryFactory(query);

    if (isFunction(resolver)) {

        const components = path ? split(path, '.') : [];

        const depth = resolver.depth || 0;
        if (!isNumber(depth)) throw new TypeError(`Resolver depth must be a number, ${typeof depth} given`);

        const key  = take(components, depth);
        const rest = takeRight(components, components.length - depth);

        return Promise.resolve(resolver(context, subQuery({path: key, rest})))

            .then(returnedResolver => resolve(returnedResolver, subQuery({path: rest.join('.')}), context));
    }

    if (!path) { // We're at the end of the path chain

        if (isObject(resolver) && !resolver.__noResolve && !isArray(resolver)) {

            if (resolver instanceof Date) // The resolver is a date, cast to string
                return resolver.toISOString();

            else if (isPrimitiveObject(resolver)) // The resolver is a "primitive", cast to string
                return resolver.toString();

            if (resolver.toJSON) { // The resolver has a "toJSON" method, invoke that
                resolver                 = resolver.toJSON();
                resolver.__autoConverted = true;
            }

            // @TODO allow ƒor middleware/converters (?)

            // Resolve all properties of the object
            return bluebird.props(mapValues(resolver, subResolver => {

                return resolve(subResolver, subQuery({path: '', implicit: true}), context);
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
                return Promise.resolve(resolve(get(resolver, key), subQuery({path: restPath}), context));
        }

        // The resolver was not an object
        // or did not have a property at the first component of the remaining path
        return Promise.reject(new NoDataAtPathError(query));
    }
};

/**
 * Convert request path (e.g. /user/accounts) to object path (e.g. user.accounts)
 * @param {string} path
 */
const convertPath = path => replace(trim(path, '/'), /\//g, '.');

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

/**
 * Higher order resolver that sets the depth on a resolver
 * @param {Number} depth
 * @return {Function}
 */
const deep = (depth = 0) => fn => {
    fn.depth = depth;
    return fn;
};

/**
 * Higher order resolver that makes sure the resolver is only called when the path was specifically requested for
 * (no implicit resolving)
 * @param {Function} fn
 * @return {Function}
 */
const onDemand = () => fn => (_, query) => query.implicit ? transparent : fn;

/**
 * Higher order resolver that makes sure the resolver is only called when the path was specifically requested for
 * AND a subpath is given
 * (no implicit resolving)
 * @param {Function} fn
 * @return {Function}
 */
const hub = () => fn => (_, query) => (query.implicit || !query.rest.length) ? transparent : fn;

/**
 * Given the resolver, resolve all requested paths and merge them into a single object
 * @param {Object} resolver
 * @param {String[]} paths
 * @param {Object} [context]
 * @returns {Promise}
 */
const resolveMultiple = (resolver, paths, context) => {

    let results = {};

    return bluebird.all(map(paths, syncPath => {

        if (!startsWith(syncPath, '/'))
            throw new TypeError(`Paths for sync() should start with "/" ("${syncPath}" given)`);

        let path = convertPath(syncPath);

        const resultOrPromise = resolve(resolver, {path}, context);

        return Promise.resolve(resultOrPromise).then(value => mergeOrSet(results, path, value));

    })).then(() => results);
};

module.exports = {
    NoDataAtPathError,
    onDemand,
    hub,
    deep,
    transparent,
    erase,
    components,
    resolve,
    convertPath,
    mergeOrSet,
    resolveMultiple
};