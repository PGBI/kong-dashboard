var path = require('path');
var koa = require('koa');
var mount = require('koa-mount');
var serve = require('koa-static');
var auth = require('basic-auth');
var request = require('request');

var Server = function() {
  this.start = function(backendConfig, angularConfig) {
    console.log('Starting Kong Dashboard on port ' + backendConfig.port);
    var webapp = serveStaticApp();
    var backend = serveProxy(backendConfig.kong_url);
    var config = serveConfigEndpoint(angularConfig);

    var app = new koa();
    if (Object.keys(backendConfig.auth_basic).length > 0) {
      addBasicAuthMiddleware(app, backendConfig.auth_basic);
    }
    app
      .use(mount('/', webapp))
      .use(mount('/config', config))
      .use(mount('/proxy', backend));
    app.listen(backendConfig.port);

    console.log('Kong Dashboard has started on port ' + backendConfig.port);
  }
};

module.exports = Server;

function serveStaticApp() {
  return new koa()

    // Middleware adding response headers
    .use((ctx, next) => {
      // defense against clickjacking - https://www.owasp.org/index.php/Clickjacking
      ctx.set('X-Frame-Options', 'Deny');
      return next();
    })

    // Serving angular app.
    .use(serve(path.join(__dirname, '../public')));
}

function serveConfigEndpoint(config) {
  return new koa()
    .use((ctx, next) => {
      ctx.set('content-type', 'application/json; charset=utf-8');
      ctx.body = JSON.stringify(config);
    })
}

function serveProxy(kong_url) {
  return new koa()
    // proxy requests
    .use((ctx, next) => {
      ctx.set('content-type', 'application/json; charset=utf-8');
      return new Promise((resolve, reject) => {
        request({
          method: ctx.req.method,
          uri: kong_url + ctx.req.url
        }, function(error, response, body) {
          ctx.body = body;
          resolve();
        });
      });
    });
}

function addBasicAuthMiddleware(app, credentials) {
  app.use((ctx, next) => {
    if (ctx.request.method == 'OPTIONS') {
      return next();
    }
    var user = auth(ctx);
    if (!user || !credentials[user.name] || credentials[user.name] != user.pass) {
      ctx.set('WWW-Authenticate', 'Basic');
      ctx.body = 'You must authenticate to access this dashboard';
      ctx.status = 401;
      return;
    }
    return next();
  });
}
