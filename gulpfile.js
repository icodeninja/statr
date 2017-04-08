const gulp       = require('gulp'),
      ugly       = require('gulp-uglify'),
      browserify = require('browserify'),
      babelify   = require('babelify'),
      source     = require('vinyl-source-stream'),
      streamify  = require('gulp-streamify'),
			sass       = require('gulp-sass'),
			concat     = require('gulp-concat');

gulp.task('js', ['lint'], () => {
  return browserify('src/main.js')
    .transform(babelify, {presets: ['es2015', 'react']})
    .bundle()
    .pipe(source('app.js'))
    .pipe(gulp.dest('dist/app'));
});

gulp.task('scripts', () => {
  return browserify('scripts/main.js')
    .transform(babelify, {presets: ['es2015']})
    .bundle()
    .pipe(source('content.js'))
    .pipe(gulp.dest('dist/scripts'));
});

gulp.task('sass', () => {
	return gulp.src(['src/**/*.scss'])
		.pipe(sass().on('error', sass.logError))
		.pipe(concat('app.css'))
		.pipe(gulp.dest('dist/app'));
})

gulp.task('lint', () => {
  return true;
});

gulp.task('watch', () => {
  gulp.watch('src/**/*.js', ['js']);
  gulp.watch('scripts/**/*.js', ['scripts']);
  gulp.watch('src/**/*.scss', ['sass']);
});

gulp.task('default', ['sass', 'js', 'scripts', 'watch']);