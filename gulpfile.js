'use strict';

const del = require('del');
const gulp = require('gulp');
const less = require('gulp-less');
const plumber = require('gulp-plumber');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const server = require('browser-sync').create();
const mqpacker = require('css-mqpacker');
const minify = require('gulp-csso');
const rename = require('gulp-rename');
const imagemin = require('gulp-imagemin');
// const rollup = require('gulp-better-rollup');
const sourcemaps = require('gulp-sourcemaps');

gulp.task('style', function () {
  return gulp.src(['styles/style.less', 'styles/adaptation.less'])
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(postcss([
      // Mozila Firefox версии 40 и выше, Safari 10.0 и выше, Chrome 45 и выше, IE10+ (основной),
      // Edge, Google Chrome и ChromeMobile 47+, Яндекс 14+, Mobile Safari 7+, Firefox 42+, Opera 3 4+,
      // MSIE 11+, Android Browser 4+, Amigo 45+, Edge 13, Safari 9,
      // MSIE Mobile 11, UCWEB 10. Моб. устройства: iphone 5 и выше.
      autoprefixer({
        browsers: [
          'Firefox >= 40',
          'Safari >= 10',
          'Chrome >= 45',
          'IE >= 10',
          'Edge >= 12',
          'ChromeAndroid >= 47',
          'iOS >= 7',
          'Opera >= 34',
          'Android >= 4',
          'ExplorerMobile >= 11',
          'UCAndroid >= 10',
          'Last 2 versions'
        ]
      }),
      mqpacker({sort: true})
    ]))
    .pipe(sourcemaps.write(''))
    .pipe(gulp.dest('build/css'))
    .pipe(server.stream())
    //.pipe(minify())
    //.pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css'));
});

gulp.task('scripts', function () {
  return gulp.src(['scripts/**/*.js'])
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(rollup({}, 'iife'))
    .pipe(sourcemaps.write(''))
    .pipe(gulp.dest('build/js/'));
});

gulp.task('imagemin', ['copy'], function () {
  return gulp.src('images/**/*.{jpg,png,gif}')
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true})
    ]))
    .pipe(gulp.dest('build/img'));
});

gulp.task('copy-html', function () {
  return gulp.src('*.{html,ico}')
    .pipe(gulp.dest('build'))
    .pipe(server.stream());
});

gulp.task('copy-css', function () {
  return gulp.src('spasibosberbank.events/**/*.css')
    .pipe(gulp.dest('build/css/spasibosberbank_events'))
    .pipe(server.stream());
});

gulp.task('copy', ['copy-html'/* , 'scripts' */, 'style', 'copy-css'], function () {
  return gulp.src([
    'fonts/**/*.{woff,woff2}'
  ], {base: '.'})
    .pipe(gulp.dest('build'));
});

gulp.task('clean', function () {
  return del('build');
});

gulp.task('js-watch', ['scripts'], function (done) {
  server.reload();
  done();
});

gulp.task('serve', ['assemble', 'imagemin'], function () {
  server.init({
    server: './build',
    notify: false,
    open: true,
    port: 3502,
    ui: false
  });

  gulp.watch('styles/**/*.less', ['style']);
  gulp.watch('*.html').on('change', (e) => {
    if (e.type !== 'deleted') {
      gulp.start('copy-html');
    }
  });
  gulp.watch('images/**/*.{jpg,png,gif}', ['imagemin']);
  // gulp.watch('js/**/*.js', ['js-watch']);
});

gulp.task('assemble', ['clean'], function () {
  gulp.start('copy', 'style');
});

gulp.task('build', ['assemble', 'imagemin']);
