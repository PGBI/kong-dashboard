var path = require('path');
var koa = require('koa');
var mount = require('koa-mount');
var serve = require('koa-static');
var auth = require('basic-auth');
var request = require('./request');
var terminal = require('../lib/terminal');
var kongSchema = require('../lib/kong-schemas');
var bodyParser = require('koa-bodyparser');

var Server = function() {
  this.start = function(backendConfig, angularConfig) {
    terminal.info('Starting Kong Dashboard on port ' + backendConfig.port);
    var webapp = serveStaticApp();
    var backend = serveProxy(backendConfig.kongUrl, backendConfig.kongRequestOpts);
    var config = serveConfigEndpoint(angularConfig);
    var healthz = serveHealthz();

    var app = new koa();

    // health check endpoint, mounted before the basic auth middleware
    app.use(mount('/healthz', healthz));

    if (Object.keys(backendConfig.basicAuth).length > 0) {
      terminal.debug('Protecting Kong Dashboard with Basic authentication');
      addBasicAuthMiddleware(app, backendConfig.basicAuth);
    }
    app
      .use(mount('/', webapp))
      .use(mount('/config', config))
      .use(mount('/proxy', backend));
    app.listen(backendConfig.port, () => {
      terminal.success('Kong Dashboard has started on port ' + backendConfig.port);
    });
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
  config.schemas = kongSchema.get(config.kong_version);
  return new koa()
    .use((ctx, next) => {
      ctx.set('content-type', 'text/javascript; charset=UTF-8');
      ctx.body = 'var __env = ' + JSON.stringify(config) + ';';
    })
}

function serveProxy(kongUrl, defaultOpts) {

  return new koa()
    // parse request body
    .use(bodyParser())

    // proxy requests
    .use((ctx, next) => {
      ctx.set('content-type', 'application/json; charset=utf-8');
      debugRequest(ctx.request);
      var opts = Object.assign({}, defaultOpts);
      Object.assign(opts, {
        method: ctx.req.method,
        url: kongUrl + ctx.req.url,
        json: true,
        body: ctx.request.body
      });
      return request.send(opts).then((response) => {
        debugResponse(response);
        ctx.body = response.body;
        ctx.status = response.statusCode;
      });
    });
}

function serveHealthz() {
    return new koa().use(ctx => {
        ctx.body = '';
    });
}

function debugRequest(request) {
  terminal.debug({
    event: 'forwards request',
    method: request.method,
    path: request.url,
    headers: request.headers,
    body: request.body
  });
}

function debugResponse(response) {
  var body;
  try {
    body = JSON.parse(response.body);
  } catch(e) {
    body = response.body;
  }
  terminal.debug({
    event: 'receives response',
    headers: response.headers,
    status: response.statusCode,
    body: body
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
