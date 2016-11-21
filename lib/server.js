/**
 * A proxy server with basic auth
 */

var path = require('path');
var koa = require('koa');
var addSlashes = require('koa-add-trailing-slashes');
var mount = require('koa-mount');
var serve = require('koa-static');
var auth = require('basic-auth');
var httpProxy = require('http-proxy');

// app
var app = koa();

// add trailing slashes
app.use(addSlashes());

// serve static page
app.use(mount('/dashboard', serve(path.join(__dirname, '../public'))));

// create a proxy
var proxy = httpProxy.createProxyServer();

// proxy requests
var name = process.env['kong-dashboard-name'];
var pass = process.env['kong-dashboard-pass'];
app.use(function *(next){
  var ctx = this;
  var credentials = auth(ctx.req)
  if (ctx.request.method !== 'OPTION' && name) {
    // check basic auth
    if (!credentials || credentials.name !== name || credentials.pass !== pass) {
      ctx.response.status = 401;
      ctx.response.headers['WWW-Authenticate'] = 'Basic realm="example"';
      ctx.body = 'Access denied';
      return;
    }
  }
  // proxy requests
  yield new Promise(function (resolve, reject) {
    proxy.web(ctx.req, ctx.res, {target: ctx.request.headers['kong-node-url']}, function (err) {
      resolve();
    });
  });
});

app.listen(process.env.port || 8080);

console.log('Server is runding on port ' + (process.env.port || 8080));
