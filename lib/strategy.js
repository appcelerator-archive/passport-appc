'use strict';

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
 *   - `appcURL`              URL for the Appcelerator Dashboard to login to (`{callbackURL}` will be replaced)
 *   - `callbackURL`          URL to which the service provider will redirect the user after obtaining authorization
 *   - `requireCallbackURL`   Set to TRUE to require to be on callbackURL before verifying SID
 *   - `sessionKey`						Key used to manage an auth session
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
	this._requireCallbackURL = !!options.requireCallbackURL;
	this._sessionKey = options.sessionKey || 'appc';
	this._appcURL = options.appcURL || AppC.baseurl + '/?redirect={callbackURL}';
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
Strategy.prototype.authenticate = function (req, options) {
	options = options || {};

	if (!req.session) {
		return this.error(new Error('AppCStrategy requires session support. Did you forget app.use(express.session(...))?'));
	}

	var self = this;

	// old or new SID cookie
	var sid = req.cookies['dashboard.sid'] || req.cookies['connect.sid'];

	// taken from passport-oauth1
	var callbackURL = options.callbackURL || this._callbackURL;
	var currentURL = utils.originalURL(req, {
		proxy: this._trustProxy
	});
	if (callbackURL) {
		var parsed = url.parse(callbackURL);
		if (!parsed.protocol) {
			// The callback URL is relative, resolve a fully qualified URL from the
			// URL of the originating request.
			callbackURL = url.resolve(currentURL, callbackURL);
		}
	}

	// URL to dashboard, including redirect param to our own callbackURL or currentURL
	var appcURL = self._appcURL.replace('{callbackURL}', encodeURIComponent(callbackURL || currentURL));
	var requireCallbackURL = (typeof options.requireCallbackURL !== 'undefined') ? !!options.requireCallbackURL : this._requireCallbackURL;

	var sessionStatus = req.session[self._sessionKey];
winston.info('120 ' + sessionStatus);
	// we have an SID without going through AppC or our callback and allowed to validate directly
	if (!sessionStatus && sid && !requireCallbackURL) {
		winston.info('123 ' + sid);
		sessionStatus = 'direct';
	}

	// validate SID
	if (sessionStatus || (!requireCallbackURL && sid)) {
		winston.info('129 ' + sessionStatus);
		delete req.session[self._sessionKey];

		// get AppC session (including user info) by SID
		AppC.Auth.createSessionFromID(sid, function (err, session) {
			var appcID;

			if (err) {

				// expired SID
				if (err.code === 403 && sessionStatus !== 'signin') {
					req.session[self._sessionKey] = 'signin';

					winston.info('142 ');

					// redirect to AppC to login
					return self.redirect(appcURL);

				} else {

					winston.info('149 ' + require('util').inspect(err));

					return self.error(err);
				}
			}

			self._verify(session, function (err, user, info) {

				if (err) {
					winston.info('158 ');
					return self.error(err);
				}

				if (!user) {
					winston.info('163 ');
					return self.fail(info);
				}
winston.info('166 ');
				self.success(user, info);
			});

		});

	} else {

		console.info('172');

		// SID found
		if (sid) {
			console.info('176 ' + sid);
			req.session[self._sessionKey] = 'bypass';

			// redirect to callbackURL to validate
			return self.redirect(callbackURL);

		} else {
			console.info('183 ');
			req.session[self._sessionKey] = 'signin';

			// redirect to dashboard to login
			return self.redirect(appcURL);
		}
	}
};

/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
