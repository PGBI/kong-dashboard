var path = require('path');
var koa = require('koa');
var mount = require('koa-mount');
var serve = require('koa-static');
var auth = require('basic-auth');
var request = require('./request');
var terminal = require('../lib/terminal');


var Server = function() {
  this.start = function(backendConfig, angularConfig) {
    terminal.info('Starting Kong Dashboard on port ' + backendConfig.port);
    var webapp = serveStaticApp();
    var backend = serveProxy(backendConfig.kongUrl);
    var config = serveConfigEndpoint(angularConfig);

    var app = new koa();
    if (Object.keys(backendConfig.basicAuth).length > 0) {
      terminal.debug('Protecting Kong Dashboard with Basic authentication');
      addBasicAuthMiddleware(app, backendConfig.basicAuth);
    }
    app
      .use(mount('/', webapp))
      .use(mount('/config', config))
      .use(mount('/proxy', backend));
    app.listen(backendConfig.port);

    terminal.success('Kong Dashboard has started on port ' + backendConfig.port);
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

function serveProxy(kongUrl) {
  return new koa()
    // proxy requests
    .use((ctx, next) => {
      ctx.set('content-type', 'application/json; charset=utf-8');
      debugRequest(ctx.req);
      var opts = {
        method: ctx.req.method,
        url: kongUrl + ctx.req.url
      };
      return request.send(opts).then((response) => {
        debugResponse(response);
        ctx.body = response.body;
      });
    });
}

function debugRequest(req) {
  terminal.debug({
    event: 'forwards request',
    method: req.method,
    path: req.url,
    headers: req.headers,
    data: req.data
  });
}

function debugResponse(res) {
  terminal.debug({
    event: 'receives response',
    headers: res.headers,
    body: JSON.parse(res.body)
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
