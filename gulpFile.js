var gulp = require('gulp');
var webserver = require('gulp-webserver');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var del = require('del');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var path = require('path');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var plumber = require('gulp-plumber');
var plumberOptions = {
    errorHandler: function (err) {
        console.log(err);
        this.emit('end');
    }
};

gulp.task('default', function() {
    console.log('gulp serve - launch local server.');
    console.log('gulp build - build js and css files.');
});

gulp.task('serve', function() {
    gulp.watch('./bower_components/**/*.js', ['uglify_js']);
    gulp.watch('./src/**/*.js', ['uglify_js']);
    gulp.watch('./src/**/*.scss', ['scss']);
    gulp.watch('./src/**/*.html', ['copy']);

    gulp.src('public')
        .pipe(webserver({
            livereload: false,
            directoryListing: false,
            open: true,
            port: 8080
        }));
});

gulp.task('build', ['clean'], function() {
    gulp.start('uglify_js');
    gulp.start('scss');
    gulp.start('copy');
});

gulp.task('clean', function() {
    return del(['./public/**/*']);
});

gulp.task('scss', function() {
    return gulp.src(['./src/scss/**/*.scss'])
        .pipe(concat('app.min.css'))
        .pipe(plumber(plumberOptions))
        .pipe(sass())
        .pipe(minifyCss())
        .pipe(gulp.dest('./public/css'))
});

gulp.task('copy', function () {
    gulp.src('./src/index.html').pipe(gulp.dest('./public'));
    gulp.src('./src/html/**/*').pipe(gulp.dest('./public/html'));

    gulp.src('./bower_components/material-design-icons/iconfont/*').pipe(gulp.dest('./public/font/material-design-icons'));
    gulp.src('./bower_components/Materialize/dist/font/roboto/*').pipe(gulp.dest('./public/font/roboto'));
});

gulp.task('uglify_js', function() {
    return gulp.src([
        "bower_components/jquery/dist/jquery.min.js",
        "bower_components/angular/angular.min.js",
        "bower_components/angular-route/angular-route.min.js",
        "bower_components/angular-cookies/angular-cookies.min.js",
        "bower_components/angular-animate/angular-animate.min.js",
        "bower_components/angular-sanitize/angular-sanitize.min.js",
        "bower_components/Materialize/dist/js/materialize.min.js",
        "src/js/**/*.js"
    ])
        .pipe(concat('app.min.js'))
        .pipe(plumber(plumberOptions))
        .pipe(uglify())
        .pipe(gulp.dest('./public/js'));
});
