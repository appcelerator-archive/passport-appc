"use strict";

/**
 * Module dependencies.
 */
var passport = require('passport-strategy'),
  AppC = require('appc-platform-sdk'),
  util = require('util'),
  utils = require('./utils'),
  url = require('url');

/**
 * Creates an instance of `Strategy`.
 *
 * The AppC authentication strategy passes authentication by verifiying the
 * session ID found in a cookie shared by all AppC domains.
 *
 * Applications must supply a `verify` callback, for which the function
 * signature is:
 *
 *     function(session, done) { ... }
 *
 * The verify callback is responsible for finding or creating the user, and
 * invoking `done` with the following arguments:
 *
 *     done(err, user, info);
 *
 * `user` should be set to `false` to indicate an authentication failure.
 * Additional `info` can optionally be passed as a third argument, typically
 * used to display informational messages.  If an exception occured, `err`
 * should be set.
 *
 * Options:
 *
 *   - `appcURL`       URL for the Appcelerator Dashboard to login to (`{callbackURL}` will be replaced)
 *   - `callbackURL`   URL to which the service provider will redirect the user after obtaining authorization
 *
 * Examples:
 *
 *     passport.use(new AppcStrategy({
 *         callbackURL: 'https://www.example.net/auth/example/callback'
 *       },
 *       function(session, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         })
 *       }
 *     ));
 *
 * @constructor
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
  if (typeof options === 'function') {
    verify = options;
    options = undefined;
  }
  options = options || {};

  if (!verify) {
    throw new TypeError('AppcStrategy requires a verify callback');
  }

  passport.Strategy.call(this);
  this.name = 'appc';
  this._verify = verify;
  this._callbackURL = options.callbackURL;
  this._appcURL = options.appcURL || 'https://dashboard.appcelerator.com/?next={callbackURL}';
}

/**
 * Inherit from `passport.Strategy`.
 */
util.inherits(Strategy, passport.Strategy);

/**
 * Pass authentication without verifying credentials.
 *
 * @param {Object} req
 * @param {Object} options
 * @api protected
 */
Strategy.prototype.authenticate = function(req, options) {

  var self = this;

  // old or new SID cookie
  var sid = req.cookies['dashboard.sid'] || req.cookies['connect.sid'];

  console.log('sid', sid);

  var callbackURL = options.callbackURL || this._callbackURL;
  if (callbackURL) {
    var parsed = url.parse(callbackURL);
    if (!parsed.protocol) {
      // The callback URL is relative, resolve a fully qualified URL from the
      // URL of the originating request.
      callbackURL = url.resolve(utils.originalURL(req, {
        proxy: this._trustProxy
      }), callbackURL);
    }
  }

  var _appcURL = self._appcURL.replace('{callbackURL}', encodeURIComponent(callbackURL));

  if (!sid) {
    return self.redirect(_appcURL);
  }

  // get AppC session (including user info) by SID
  AppC.Auth.createSessionFromID(sid, function onCreateSessionFromID(err, session) {
    var appcID;

    console.log('err', util.inspect(err));
    console.log('session', util.inspect(session));

    if (err) {

      // expired SID
      if (err.code === 403) {

        // redirect to AppC to login
        return self.redirect(_appcURL);

      } else {
        return self.error(err);
      }
    }

    self._verify(session, function(err, user, info) {

      if (err) {
        return self.error(err);
      }

      if (!user) {
        return self.fail(info);
      }

      self.success(user, info);
    });

  });
};

/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
