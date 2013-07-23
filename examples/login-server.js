var config = require('../config.json');

var proxy = require('http-proxy');

var express = require('express'),
    passport = require('passport'),
    GoogleStrategy = require('passport-google').Strategy;

/* routing proxy for example server */
var server = proxy.createServer({
    pathnameOnly: true,
    router: {
        '/login':     config.targetHost + ':' + config.loginListenPort,
        '/protected': config.targetHost + ':' + config.protectedListenPort
    }
});

console.log("Front proxy server listening on " + config.proxyListenPort);
server.listen(config.proxyListenPort);

/* example login server */
var app = express();

app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');

  // express config
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieSession({ 
    secret: config.cookieSecret, 
    cookie: config.cookieOptions
  }));

  // passport
  app.use(passport.initialize());
  app.use(passport.session());
});

app.get('/', passport.authenticate('google'));
app.get('/google/return', passport.authenticate('google'), function(req, res) { res.redirect('/login/home'); });
app.get('/home', function(req, res) {res.end('Login site');});

app.listen(config.loginListenPort);
console.log("Express server listening on " + config.loginListenPort);

passport.use(new GoogleStrategy({
      returnURL: config.loginReturnUrl,
      realm: config.loginRealm
    },
    function(identifier, profile, done) {
        profile.id = identifier;

        var email = profile.emails[0].value;
        if (email.indexOf(config.emailFilter))
            done(null, profile);
        else
            done({ message: "Invalid login" });
    }
));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) { 
    done(null, obj); 
});
