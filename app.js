var config = require('./config.json')

var proxy = require('http-proxy')
  , passport = require('passport')
  , connect = require('connect')


var injector = {};

var currentUser;

injector.query = 'body';
injector.func = function(body) {
    body.update(function(html) {
        var loginWidget = '<div class="LoginWidget" style="'
            + ' position: absolute; left: 0; top: 0; border-radius: 4px; padding-top: 3px;'
            + ' height: 21px; width: 24px; background-color: rgba(180,180,180,0.5); color: gray;"'
            + ' ><a href="' + config.loginUrl + '"' 
            + ' style="display: block; height: 20px; width: 24px; font-family: sans-serif;'
            + ' text-decoration: none; color: gray; text-align: center; font-weight: bold;"'
            + ' title="' + currentUser + '">G</a>'
            + '</div>';
        loginWidget += html;
        return loginWidget;
    });
};

var server = proxy.createServer(
    connect.cookieParser(),
    // TODO: fix unmodified cookieSession behaviour
    connect.cookieSession({ secret: config.cookieSecret, cookie: config.cookieOptions }),
    
    passport.initialize(),
    passport.session(),

    function(req, res, next) {
        if (req.isAuthenticated()
            && req.user 
            && req.user.emails
            && req.user.emails[0].value.indexOf(config.emailFilter) > -1) 
        { 
            console.log(req.user.emails[0].value);
            currentUser = req.user.emails[0].value;
            return next(); 
        }

        // TODO: set protocol dynamically
        req.session.redirectUrl = 'http' + '://' + config.thisHostName + req.url;
        res.writeHead(302, {
            'Location': config.loginUrl
        });
        res.end();
    },
    
    // TODO: implement filter
    require('harmon')(null, [injector]),
    config.targetPort,
    config.targetHost
);

server.listen(config.listenPort);
console.log("Portal server listening on " + config.listenPort);


passport.deserializeUser(function(obj, done) { 
    done(null, obj); 
});
