const { src, dest, watch, series } = require('gulp');
const terser = require('gulp-terser');
const minify = require('gulp-clean-css');
const sass = require('gulp-sass')(require('sass'));
const prefix = require('gulp-autoprefixer');


// compile sass
const compileSass = () => {
    return src('./public/scss/style.scss')
        .pipe(sass())
        .pipe(prefix())
        .pipe(minify())
        .pipe(dest('dist/css'))
}

// minify js
const minifyJs = () => {
    return src('./public/js/*.js')
        .pipe(terser())
        .pipe(dest('dist/js'))
}

// watch task
const watchTask = () => {
    watch('./public/scss/style.css', compileSass)
    watch('./public/js/*.js', minifyJs)
}

// default gulp
exports.default = series( compileSass, minifyJs );
exports.dev = series( compileSass, minifyJs, watchTask );