import gulp from 'gulp';
import plumber from 'gulp-plumber';
import sass from 'gulp-dart-sass';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import browser from 'browser-sync';
import htmlmin from 'gulp-htmlmin';
import rename from 'gulp-rename';
import csso from 'postcss-csso';
import {deleteAsync} from 'del';
import terser from 'gulp-terser';
import imagemin from 'gulp-imagemin';

// HTML

export const html = () => {
  return gulp.src('source/**/*.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(rename({
      suffix: "-min"
    }))
    .pipe(gulp.dest('build/'))
}

// Styles

export const css = () => {
  return gulp.src('source/sass/style.scss', { sourcemaps: true })
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename({
      suffix: "-min"
    }))
    .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
    .pipe(browser.stream());
}

// JS

export const js = () => {
  return gulp.src('source/js/**/*.js')
    .pipe(terser())
    .pipe(gulp.dest('build/js'))
    .pipe(browser.stream());
}

// Images

export const optimizeImages = () => {
	return gulp.src('source/images/**/*')
		.pipe(imagemin())
		.pipe(gulp.dest('build/images'))
};

// Copy

const copy = () => {
    return gulp.src([
      'source/fonts/*'])
    .pipe(gulp.dest('build/fonts'))
  }

  const copyIco = () => {
    return gulp.src([
      'source/*.ico'])
    .pipe(gulp.dest('build/images'))
}

// Del

const clean = () => {
  return deleteAsync(['build/**/*', '!build/images']);
};

const cleanImages = () => {
  return deleteAsync(['build/images']);
}

// Server

const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build',
      index: 'index-min.html'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

// Watcher

const watcher = () => {
  gulp.watch('source/sass/**/*.scss', gulp.series(css));
  gulp.watch('source/*.html').on('change', browser.reload);
  gulp.watch('source/*.html', gulp.series(html));
  gulp.watch('source/js/**/*.js', gulp.series(js));
  gulp.watch('source/images/**/*').on('all', gulp.series(cleanImages, optimizeImages, browser.reload))
}

export const images = gulp.series(
  cleanImages,
  optimizeImages
)

export const build = gulp.series(
  gulp.parallel(
    clean,
    cleanImages
  ),
  copy,
  gulp.parallel(
    optimizeImages,
    html,
    css,
    js
  )
);

export default gulp.series(
  clean,
  gulp.parallel(
    html,
    css,
    js
  ),
  gulp.parallel(
    server,
    watcher
  )
);
