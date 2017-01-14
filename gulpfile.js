const gulp = require('gulp'),
  babel = require('gulp-babel'),
  watch = require('gulp-watch'),
  gls = require('gulp-live-server');


gulp.task('default', ['js', 'watch']);

gulp.task('js', () => {
    return gulp.src('src/**/*.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('watch', function () {
    // Callback mode, useful if any plugin in the pipeline depends on the `end`/`flush` event 
    gulp.watch('src/**/*.js', ['js'])
});

