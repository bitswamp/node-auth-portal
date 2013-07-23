var config = require('./config.json')

var proxy = require('http-proxy')
  , passport = require('passport')
  , connect = require('connect')

var server = proxy.createServer(
    connect.cookieParser(),
    // TODO: fix unmodified cookieSession behaviour
    connect.cookieSession({ secret: config.cookieSecret, cookie: config.cookieOptions }),
    
    passport.initialize(),
    passport.session(),

    // TODO: fix passport.authorize failures
    function(req, res, next) { 
        if (req.user 
            && req.user.emails
            && req.user.emails[0].value.indexOf(config.emailFilter) > -1) {
            next();
        }
        else {
            res.writeHead(302, {
                'Location': config.loginUrl
            });
            res.end();
        }
    },
    
    // TODO: implement filter
    require('harmon')(null, null),
    config.targetPort,
    config.targetHost
);

server.listen(config.listenPort);
console.log("Portal server listening on " + config.listenPort);


passport.deserializeUser(function(obj, done) { 
    done(null, obj); 
});
