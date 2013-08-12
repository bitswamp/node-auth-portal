var configPath = "./config.json";
var config = require(configPath);

var proxy = require('http-proxy'),
    passport = require('passport'),
    connect = require('connect');

var injector,
    currentUser;


var loginWidget =
    '<div style="[divStyle]"><a href="[target]" style="[linkStyle]" title="[linkTitle]">[linkText]</a></div>'
    .replace("[divStyle]", config.widget.divStyle || "")
    .replace("[target]", config.widget.target || config.loginUrl || "")
    .replace("[linkStyle]", config.widget.linkStyle || "")
    .replace("[linkText]", config.widget.linkText || "");

injector = {};

// insert the login widget at the top of the <body> tag
injector.query = 'body';
injector.func = function(body) {
    body.update(function(html) {
        return loginWidget.replace("[linkTitle]", config.widget.linkTitle || currentUser || "") + html;
    });
};


var server = proxy.createServer(
    function(req, res, next) {
        // fix for connect cookie middleware expecting req.originalUrl
        req.originalUrl = req.url;
        next();
    },
    connect.cookieParser(),
    connect.cookieSession({ secret: config.cookieSecret, cookie: config.cookieOptions }),

    passport.initialize(),
    passport.session(),

    function(req, res, next) {
        if (req.isAuthenticated()
            && req.user
            && req.user.authname
            && req.user.authname.indexOf(config.emailFilter) > -1)
        {
            console.log(req.user.authname);
            currentUser = req.user.authname;
            return next();
        }

        req.session.redirectUrl = (req.connection.encrypted ? 'https' : 'http') + '://' + req.headers.host + req.url;

        res.writeHead(302, {
            'Location': config.loginUrl
        });
        res.end();
    },

    require('harmon')(null, [injector]),
    config.router
);

server.listen(config.listenPort);
console.log("auth-portal listening on " + config.listenPort);


passport.deserializeUser(function(obj, done) {
    done(null, obj);
});
