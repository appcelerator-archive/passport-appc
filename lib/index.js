/**
 * Module dependencies.
 */
var Strategy = require('./strategy');

/**
 * Framework version.
 */
require('pkginfo')(module, 'version');

/**
 * Expose constructors.
 */
exports.Strategy = Strategy;

/**
 * Expose appc-platform-sdk for nodebb-plugin-appc.
 */
exports.AppC = require('appc-platform-sdk');
