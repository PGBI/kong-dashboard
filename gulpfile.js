'use strict';

var spawn = require('child_process').spawn;
var concat = require('gulp-concat');
var fs = require('fs');
var gulp = require('gulp');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var plumber = require('gulp-plumber');
var terminal = require('./lib/terminal');

// Define file path variables
var paths = {
  root:     'src',
  sass_src: 'src/scss',
  dist:     'public'
};

gulp.task('build_js', function () {
  return gulp
    .src([
      "./node_modules/jquery/dist/jquery.min.js",
      "./node_modules/angular/angular.min.js",
      "./node_modules/angular-route/angular-route.min.js",
      "./node_modules/angular-cookies/angular-cookies.min.js",
      "./node_modules/angular-animate/angular-animate.min.js",
      "./node_modules/angular-sanitize/angular-sanitize.min.js",
      "./node_modules/materialize-css/dist/js/materialize.min.js",
      "./node_modules/ng-infinite-scroll/build/ng-infinite-scroll.min.js",
      paths.root + '/**/*.js'
    ])
    .pipe(plumber())
    .pipe(uglify())
    .pipe(concat('app.min.js'))
    .pipe(gulp.dest(paths.dist + '/js'));
});

gulp.task('copy_assets', function(done) {
  gulp.src(['src/**/*.html'])
    .pipe(gulp.dest(paths.dist));
  gulp.src([paths.root + '/images/**'])
    .pipe(gulp.dest(paths.dist + '/images'));
  gulp.src(['node_modules/materialize-css/dist/fonts/roboto/**/*'])
    .pipe(gulp.dest(paths.dist + '/fonts/roboto'));
  done();
});

gulp.task('build_css', function() {
  var src_file = 'app.scss';
  if (fs.existsSync(paths.sass_src + '/custom_app.scss')) {
    src_file = 'custom_app.scss';
  }
  return gulp.src([paths.sass_src + '/' + src_file])
    .pipe(plumber())
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(concat('app.min.css'))
    .pipe(gulp.dest(paths.dist + '/css'));
});

gulp.task('build', gulp.parallel('build_js', 'build_css', 'copy_assets'));

gulp.task('watch:js', function(done) {
  gulp.watch(paths.root + '/**/*.js', gulp.parallel('build_js'));
  done();
});

gulp.task('watch:assets', function(done) {
  gulp.watch(paths.root + '/**/*.html', gulp.parallel('copy_assets'));
  done();
});

gulp.task('watch:css', function(done) {
  gulp.watch(paths.root + '/**/*.scss', gulp.parallel('build_css'));
  done();
});

gulp.task('watch', gulp.parallel('watch:js', 'watch:assets', 'watch:css'));

gulp.task('serve', gulp.series('build', 'watch', function() {
  console.log('serving');
  var args = process.argv;
  args = args.slice(3);
  args.unshift('start');
  var kd = spawn(__dirname + '/bin/kong-dashboard.js', args);
  kd.stdout.on('data', function(data) {
    terminal.success('kong-dashboard stdout: ' + data.toString().trim());
  });
  kd.stderr.on('data', function(data) {
    terminal.warning('kong-dashboard stderr: ' + data.toString().trim());
  });
  kd.on('close', function(code) {
    terminal.error('kong-dashboard exited');
  });
}));
