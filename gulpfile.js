const { src, dest, series, parallel, watch } = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const cssnano = require("gulp-cssnano");
const autoprefixer = require("gulp-autoprefixer");
const rename = require("gulp-rename");
const babel = require("gulp-babel");
const uglify = require("gulp-uglify");
const imagemin = require("gulp-imagemin");
const sourcemaps = require("gulp-sourcemaps");
const browserSync = require("browser-sync").create();
const reload = browserSync.reload;
const clean = require("gulp-clean");
const kit = require("gulp-kit");

const paths = {
  htmlKit: "./html/**/*.kit",
  dist: "./dist",
  sass: "./src/sass/**/*.scss",
  sassDest: "./dist/css",
  js: "./src/js/**/*.js",
  jsDest: "./dist/js",
  imgs: "./src/img/*",
  imgsDest: "dist/img",
  html: "./*.html",
};

function sassCompiler(done) {
  src(paths.sass)
    .pipe(sourcemaps.init())
    .pipe(sass().on("error", sass.logError))
    .pipe(autoprefixer())
    .pipe(cssnano())
    .pipe(rename({ suffix: `.min` }))
    .pipe(sourcemaps.write())
    .pipe(dest(paths.sassDest));
  done();
}

function javaScript(done) {
  src(paths.js)
    .pipe(sourcemaps.init())
    .pipe(
      babel({
        presets: ["@babel/env"],
      })
    )
    .pipe(uglify())
    .pipe(rename({ suffix: `.min` }))
    .pipe(sourcemaps.write())
    .pipe(dest(paths.jsDest));
  done();
}

function imageMin(done) {
  src(paths.imgs).pipe(imagemin()).pipe(dest(paths.imgsDest));
  done();
}

function startBrowserSync(done) {
  browserSync.init({
    server: {
      baseDir: "./",
    },
  });
  done();
}

function watchForChanges(done) {
  watch(paths.html).on("change", reload);
  watch([paths.sass, paths.js], parallel(sassCompiler, javaScript)).on(
    "change",
    reload
  );
  watch(paths.imgs, imageMin).on("change", reload);
  done();
}

function cleanStuff(done) {
  src(paths.dist, { read: false }).pipe(clean());
  done();
}

function handleKits(done) {
  src(paths.htmlKit).pipe(kit()).pipe(dest("./"));
  done();
}

const mainFunctions = parallel(sassCompiler, imageMin, javaScript);
exports.cleanStuff = cleanStuff;
exports.default = series(mainFunctions, startBrowserSync, watchForChanges);
