#!/usr/bin/env node

var fs = require('fs-extra');
var sass = require('node-sass');
var rimraf = require('rimraf');
var uglify_js = require('uglify-js');
var glob = require('glob');
var child_process = require('child_process');

exports.build = function() {
    rimraf('public', function (err) {
        if (err) throw err;
        fs.mkdirSync('public');
        fs.mkdirSync('public/css');
        fs.mkdirSync('public/js');
        fs.mkdirSync('public/fonts');
        fs.mkdirSync('public/fonts/roboto');

        compile_sass();
        compile_js();
        compile_html();
    });
};

exports.serve = function(port, auth) {
    // launch server
    console.log('Launching webserver');
    if (port) {
        process.env['kong-dashboard-port'] = port;
    }
    if (auth) {
        auth = auth.split('=');
        process.env['kong-dashboard-name'] = auth[0];
        process.env['kong-dashboard-pass'] = auth[1];
    }
    var server = child_process.fork(__dirname + '/server', [], {
        env: process.env
    });
    server.on('message', function (message) {
        process.stdout.write(message);
    });
    server.on('close', function (message) {
        process.stdout.write('Proxy server is down.');
    });
    server.on('error', handle_error);
};

var compile_sass = function() {
    console.log('Generating css files');
    var data;
    try {
        data = fs.readFileSync("./src/scss/_custom_theme.scss", "utf-8");
    } catch (err) {
        data = '';
    }
    data += fs.readFileSync("./src/scss/app.scss", "utf-8");

    sass.render({
        data: data,
        outputStyle: 'compressed'
    }, function(err, result) {
        if (err) throw err;
        fs.writeFile('public/css/app.min.css', result.css.toString(), function(err) {
            if (err) throw err;
            console.log('Css files compiled');
        });
    });
};

var compile_js = function() {
    console.log('Generating js files...');
    glob("src/js/**/*.js", function (err, app_filenames) {
        if (err) throw err;
        var filenames = [
            "./node_modules/jquery/dist/jquery.min.js",
            "./node_modules/angular/angular.min.js",
            "./node_modules/angular-route/angular-route.min.js",
            "./node_modules/angular-cookies/angular-cookies.min.js",
            "./node_modules/angular-animate/angular-animate.min.js",
            "./node_modules/angular-sanitize/angular-sanitize.min.js",
            "./node_modules/materialize-css/dist/js/materialize.min.js",
            "./node_modules/ng-infinite-scroll/build/ng-infinite-scroll.min.js",
        ];
        filenames = filenames.concat(app_filenames);

        var result = uglify_js.minify(filenames, {
            outSourceMap: "app.min.js.map"
        });

        fs.writeFile('./public/js/app.min.js', result.code, function(err) {
            if (err) throw err;
            console.log('Js files compiled');
        });
        fs.writeFile('./public/js/app.min.js.map', result.map, handle_error);
    });
};

var compile_html = function() {
    fs.copy('./src/html', './public/html', handle_error);
    fs.copy('./src/index.html', './public/index.html', handle_error)
    fs.copy('./node_modules/materialize-css/dist/fonts/roboto', './public/fonts/roboto', handle_error);
};

var handle_error = function(err) {
    if (err) {
        throw err;
    }
};
