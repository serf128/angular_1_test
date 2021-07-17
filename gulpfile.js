const {src, dest, parallel, series, watch} = require('gulp');
const babel = require("gulp-babel");
const browserSync = require('browser-sync').create();
const gulpIf = require('gulp-if');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const sass = require('gulp-sass');
const autoprefixer = require('autoprefixer');
//const autoprefixer = require('gulp-autoprefixer');
const cleancss = require('gulp-clean-css');
const gcmq = require('gulp-group-css-media-queries');
const del = require('del');
const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');
const postcss = require('gulp-postcss');const purgecss = require('gulp-purgecss')

let isDev = process.argv.includes('--dev');
let isProd = !isDev;
let isSync = process.argv.includes('--sync');

let path = {
    devDomain: "angular-app",
    build: {
        html: "./build/html/",
        css: "./build/css/",
        js: "./build/js/",
        img: "./build/images/",
        fonts: "./build/fonts/",
    },
    src: {
        html: "./**/*.html",
        css: "./src/scss/root.scss",
        js: "./src/js/*.js",
        img: "./src/images/**/*.+(png|jpg|gif|ico|svg|webp)",
        fonts: "./src/fonts/**/*",
    },
    watch: {
        html: "./**/*.php",
        css: "./src/scss/**/*.scss",
        js: "./src/js/**/*.js",
        img: "./src/images/**/*"
    },
    clean: "./build/*"
}

function html() {
    return src(path.src.html)
        //.pipe(dest(path.build.html))
        //.pipe(gulpIf(isSync, browserSync.reload));
}

function images() {
    return src(path.src.img)
        .pipe(dest(path.build.img))
        //.pipe(gulpIf(isSync, browserSync.reload))
}

function styles() {
    return src(path.src.css)
        .pipe(gulpIf(isDev, sourcemaps.init()))
        .pipe(sass())
        .pipe(gcmq())
        .pipe(rename('main.min.css'))
        .pipe(postcss([
            autoprefixer({
                overrideBrowserslist: ['last 2 versions'],
                grid: true
            })
        ]))
        .pipe(cleancss({
            level: 2
        }))
        .pipe(gulpIf(isDev, sourcemaps.write()))
        .pipe(dest(path.build.css))
}

function fonts() {
    return src(path.src.fonts)
        .pipe(dest(path.build.fonts))
}

function scripts() {
    return src(path.src.js)
        .pipe(gulpIf(isDev, sourcemaps.init()))
        .pipe(babel({
            presets: ['@babel/preset-env']
        }))
        .pipe(uglify({
            toplevel: true
        }))
        .pipe(gulpIf(isDev, sourcemaps.write()))
        .pipe(rename({suffix: '.min'}))
        .pipe(dest(path.build.js))
}

function clear() {
    return del(path.clean);
}

function startWatch() {
    if (isSync) {
        browserSync.init({
            proxy: path.devDomain
        });
    }

    watch(path.watch.html).on('change', browserSync.reload);
    watch(path.watch.css, styles).on('change', browserSync.reload);
    watch(path.watch.js, scripts).on('change', browserSync.reload);
    watch(path.watch.img, images).on('change', browserSync.reload);
}


exports.build = series(clear, images, fonts, styles, scripts);
exports.watch = parallel(images, fonts, styles, scripts, startWatch);
