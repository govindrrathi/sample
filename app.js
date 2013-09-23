
/**
 * Module dependencies.
 */

var express = require('express');
var passport = require('passport');
var util = require('util');
var WindowsLiveStrategy = require('passport-windowslive').Strategy;
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var EmployeeProvider = require('./employeeprovider').EmployeeProvider;

var app = express();

var WINDOWS_LIVE_CLIENT_ID = "????"
var WINDOWS_LIVE_CLIENT_SECRET = "????";

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Windows Live profile is
//   serialized and deserialized.
passport.serializeUser(function (user, done) {
    done(null, user);
});


passport.deserializeUser(function (obj, done) {
    done(null, obj);
});


// Use the WindowsLiveStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Windows Live
//   profile), and invoke a callback with a user object.
passport.use(new WindowsLiveStrategy({
    clientID: WINDOWS_LIVE_CLIENT_ID,
    clientSecret: WINDOWS_LIVE_CLIENT_SECRET,
    callbackURL: "http://somerandom123domain.com:3000/auth/windowslive/callback"
    //callbackURL: "https://login.live.com/oauth20_desktop.srf"
},
  function (accessToken, refreshToken, profile, done) {
      // asynchronous verification, for effect...
      process.nextTick(function () {

          // To keep the example simple, the user's Windows Live profile is returned
          // to represent the logged-in user.  In a typical application, you would
          // want to associate the Windows Live account with a user record in your
          // database, and return that user instead.
          return done(null, profile);
      });
  }
));

// all environments
var fs = require('fs');
var access_logfile = fs.createWriteStream('./access.log', { flags: 'a' });

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.session({ secret: 'keyboard cat' }));
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

var employeeProvider = new EmployeeProvider('localhost', 27017);

app.get('/', function (req, res) {
    employeeProvider.findAll(function (error, emps) {
        res.render('index', {
            title: 'Employees',
            employees: emps,
            user: req.user
        });
    });
});

app.get('/account', ensureAuthenticated, function (req, res) {
    res.render('account', { user: req.user });
});


app.get('/login', function (req, res) {
    res.render('login', { user: req.user });
});

app.get('/employee/new', function (req, res) {
    res.render('employee_new', {
        title: 'New Employee'
    });
});

app.get('/employee/all', function (req, res) {
    employeeProvider.findAll(function (error, emps) {
        res.json("200", emps);
    });
});

//save new employee
app.post('/employee/new', function (req, res) {
    employeeProvider.save({
        title: req.param('title'),
        name: req.param('name')
    }, function (error, docs) {
        res.redirect('/')
    });
});

// GET /auth/windowslive
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Windows Live authentication will involve
//   redirecting the user to live.com.  After authorization, Windows Live
//   will redirect the user back to this application at
//   /auth/windowslive/callback
app.get('/auth/windowslive',
  passport.authenticate('windowslive', { scope: ['wl.signin', 'wl.basic'] }),
  function (req, res) {
      // The request will be redirected to Windows Live for authentication, so
      // this function will not be called.
  });


// GET /auth/windowslive/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/windowslive/callback',
  passport.authenticate('windowslive', { failureRedirect: '/login' }),
  function (req, res) {
      res.redirect('/');
  });


app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

app.listen(3000);

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/login')
}
