/**
 * A proxy server with basic auth
 */

var path = require('path');
var koa = require('koa');
var koa_auth = require('koa-basic-auth');
var addSlashes = require('koa-add-trailing-slashes');
var mount = require('koa-mount');
var serve = require('koa-static');
var auth = require('basic-auth');
var httpProxy = require('http-proxy');
var url_parser = require('url');

var name = process.env['kong-dashboard-name'];
var pass = process.env['kong-dashboard-pass'];

/////////////////////////
// Serving angular app //
/////////////////////////
var webapp = koa();

// Middleware adding response headers
webapp.use(function *(next){
  yield next;

  // defense against clickjacking - https://www.owasp.org/index.php/Clickjacking
  this.set('X-Frame-Options', 'Deny');
});

// Middleware handling authentication failure
webapp.use(function *(next){
  try {
    yield next;
  } catch (err) {
    if (401 == err.status) {
      this.status = 401;
      this.set('WWW-Authenticate', 'Basic');
      this.body = 'You must authenticate to access this dashboard';
    } else {
      throw err;
    }
  }
});

// Authentication middleware, if app started with basic auth.
if (name && pass) {
  webapp.use(koa_auth({ name: name, pass: pass }));
}

// Serving angular app.
webapp.use(serve(path.join(__dirname, '../public')));

/////////////////////////
// Proxy server        //
/////////////////////////

var proxyapp = koa();
var proxy = httpProxy.createProxyServer({
  proxyTimeout: 30000
});

// Authentication middleware, if app started with basic auth.
proxyapp.use(function *(next){
  if (this.request.method !== 'OPTION' && name && pass) {
    var user = auth(this);
    if (user && user.name == name && user.pass == pass) {
      yield next;
    } else {
      this.throw(401);
    }
  } else {
    yield next;
  }
});

// proxy requests
proxyapp.use(function *(next){

  var ctx = this;

  // check kong node url
  if (!ctx.request.headers['kong-node-url']) {
    ctx.body = "Kong-Node-URL header is required";
    ctx.throw(400);
  }

  var proxied_req = ctx.req;

  proxied_req.headers['host'] = url_parser.parse(ctx.request.headers['kong-node-url']).host;
  if (ctx.request.headers['x-kong-authorization']) {
    proxied_req.headers['authorization'] = ctx.request.headers['x-kong-authorization'];
  } else {
    delete proxied_req.headers['authorization'];
  }

  // proxy requests
  yield new Promise(function (resolve, reject) {
    proxy.web(proxied_req, ctx.res, {target: ctx.request.headers['kong-node-url']});
  });
});

// Proxy response error handling

proxy.on('proxyRes', function(proxyRes, req, res) {
  if (proxyRes.statusCode == 401) {
    // forwarding the 401 would make browsers invoke basic auth popup.
    proxyRes.statusCode = 511;
  }
  if (proxyRes.statusCode == 302 || proxyRes.statusCode == 301) {
    proxyRes.statusCode = 404;
  }
});

proxy.on('error', function(err, req, res) {
  if (err.code == 'ECONNRESET' || err.code == 'ECONNREFUSED' || err.code == 'ENOTFOUND') {
    res.writeHead(400, {
      'Content-Type': 'application/json'
    });
    res.end('{"message": "Can\'t connect to Kong server."}');
  } else {
    console.log(err);
    res.writeHead(500, {
      'Content-Type': 'application/json'
    });
    res.end('{"message": "Sorry, something went wrong..."}');
  }
});

//////////////////////////////////////
// Mounting webapp and proxy server //
//////////////////////////////////////

// app
var app = koa();

// add trailing slashes
app.use(addSlashes());

// serve static page
app.use(mount('/', webapp));

// serve proxy server
app.use(mount('/proxy', proxyapp));

app.listen(process.env['kong-dashboard-port']);

console.log('Server is running on port ' + process.env['kong-dashboard-port']);
