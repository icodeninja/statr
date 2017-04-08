const gulp       = require('gulp'),
      browserify = require('browserify'),
      uglify     = require('gulp-uglify'),
      babelify   = require('babelify'),
      source     = require('vinyl-source-stream'),
      streamify  = require('gulp-streamify'),
      shell      = require('gulp-shell'),
      zip        = require('gulp-zip');


gulp.task('temp', shell.task([
  'node_modules/.bin/cross-env NODE_ENV=development node_modules/.bin/webpack-dev-server --colors --config webpack.config.js'
]));

gulp.task('scripts:dev', () => {
  return browserify('src/scripts/main.js')
    .transform(babelify, {presets: ['es2015']})
    .bundle()
    .pipe(source('content.js'))
    .pipe(gulp.dest('dist/scripts'));
});

gulp.task('scripts:prod', () => {
  return browserify('src/scripts/main.js')
    .transform(babelify, {presets: ['es2015']})
    .bundle()
    .pipe(source('content.js'))
    .pipe(streamify(uglify()))
    .pipe(gulp.dest('dist/scripts'));
});

gulp.task('prep', shell.task([
  'rm -rf dist',
  'mkdir dist'
]));

gulp.task('js:prod', ['prep'], shell.task([
  'webpack -p --config webpack.config.js',
  'mv build dist/app'
]));

gulp.task('js:dev', ['prep'], shell.task([
	'webpack --config webpack.config.js',
	'mv build dist/app'
]));

const final_steps = [
  'cp misc/manifest.json dist',
  'cp src/www/* dist/app',
  'mkdir cpa',
  'cp assets/* cpa',
  'mv cpa dist/assets'
];

gulp.task('final:prod', ['js:prod', 'scripts:prod'], shell.task(final_steps));
gulp.task('final:dev', ['js:dev', 'scripts:dev'], shell.task(final_steps));

gulp.task('release', ['final:prod'], () => {
  gulp.src('dist/**/*')
    .pipe(zip('statr.zip'))
    .pipe(gulp.dest('.'));
});

gulp.task('default', ['final:dev']);
