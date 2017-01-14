const gulp = require('gulp');
const babel = require('gulp-babel');
const watch = require('gulp-watch');
const spawn = require('child_process').spawn;

gulp.task('default', ['js', 'copy', 'watch']);

gulp.task('js', () => {
    return gulp.src('src/**/*.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('copy', () => {
    return gulp.src('src/**/*.json')
    .pipe(gulp.dest('dist'));
})

gulp.task('serve', ['js', 'copy'], function() {
  spawn('node', ['dist/server.js'], { stdio: 'inherit' });
});

gulp.task('watch', function () {
    // Callback mode, useful if any plugin in the pipeline depends on the `end`/`flush` event 
    gulp.watch('src/**/*.js', ['js'])
});

