# Passport-Appcelerator

[Passport](http://passportjs.org/) strategy for authenticating with [Appcelerator Dashboard](https://dashboard.appcelerator.com/)
using its session ID shared via a cookie. Subsequently, the web application implementing this strategy must run under the same (secured) domain.

This module lets you authenticate using Appcelerator in your Node.js applications.
By plugging into Passport, Appcelerator authentication can be easily and
unobtrusively integrated into any application or framework that supports
[Connect](http://www.senchalabs.org/connect/)-style middleware, including
[Express](http://expressjs.com/).

## Install

    $ npm install passport-appc

## Usage

#### Configure Strategy

The Appcelerator authentication strategy authenticates users using a Appcelerator account. The strategy requires a `verify` callback, which accepts
the session data and calls `done` providing a user, as well as `options`
specifying an optional Appcelerator Dashboard and callback URL.

	AppcStrategy = require('passport-appc').Strategy;
	
	passport.use(new AppcStrategy({
			appcURL: "https://360-preprod.cloud.appctest.com",
			callbackURL: "https://something.cloud.appctest.com"
		},
		function(session, done) {
			User.findOrCreate({ appcId: session.user.id }, function (err, user) {
	  			return done(err, user);
			});
		}
	));

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'appc'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

    app.get('/auth/appc',
      passport.authenticate('appc'));

    app.get('/auth/appc/callback', 
      passport.authenticate('appc', { failureRedirect: '/login' }),
      function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
      });

## Tests

    $ npm install
    $ npm test

# License

This source code is the intellectual property of Appcelerator, Inc.
Copyright (c) 2014-2015 Appcelerator, Inc. All Rights Reserved.
This code MUST not be modified, copy or otherwise redistributed
without expression written permission of Appcelerator. This
software is licensed as part of the Appcelerator Platform and
governed under the terms of the Appcelerator license agreement.

Distribution through the NPM package system located at http://npmjs.org
is expressly granted if the package you are downloading is from the
official Appcelerator account at http://npmjs.org/package/passport-appc.