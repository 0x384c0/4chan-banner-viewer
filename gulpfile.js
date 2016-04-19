'use strict';

// Инициализируем плагины
var gulp = require('gulp'),
    jade = require('gulp-jade'),
    stylus = require('gulp-stylus'),
    autoprefixer = require('autoprefixer-stylus'),
    imagemin = require('gulp-imagemin'),
    browserSync = require('browser-sync').create(),
    cssbeautify = require('gulp-cssbeautify'),
    gutil = require('gulp-util'),
    newer = require('gulp-newer'),
    include = require('gulp-include'),
    rename = require("gulp-rename"),
    uglify = require('gulp-uglify'),
    imageminPngquant = require('imagemin-pngquant'),
    csscomb = require('gulp-csscomb'),
    csso = require('gulp-csso'),
    gulpFilter = require('gulp-filter'),
    plumber = require('gulp-plumber'),
    del = require('del'),
    runSequence = require('run-sequence'),
    watch = require('gulp-watch'),
    gulpZip = require('gulp-zip'),
    nodePath = require('path'),
    jadeInheritance = require('gulp-jade-inheritance'),
    gulpif = require('gulp-if'),
    cached = require('gulp-cached'),
    changed = require('gulp-changed'),
    filter = require('gulp-filter'),
    stylint = require('gulp-stylint');


// Имена папок
var config = {
    path: {
        source: 'source',
        dist: 'public',
        assets: 'assets',
        partials: 'blocks',
        js: 'js',
        css: 'css',
        images: 'img'
    }
};


// Настройки плагинов
var plugins = {
    browserSync: {
        options: {
            server: {
                baseDir: './public'
            }
        }
    }
    /*,

     autoprefixer: {
     options: {
     browsers: [
     'last 2 version',
     'Chrome >= 20',
     'Firefox >= 20',
     'Opera >= 12',
     'Android 2.3',
     'Android >= 4',
     'iOS >= 6',
     'Safari >= 6',
     'Explorer >= 8'
     ],
     cascade: false
     }
     },

     stylus: {
     options: {}
     },

     cssbeautify: {
     options: {
     indent: '	',
     autosemicolon: true
     }
     },

     jade: {
     options: {
     pretty: '\t',
     basedir: config.path.source
     }
     },

     jadeInheritance: {
     options: {basedir: config.path.source}
     },

     imagemin: {
     options: {
     optimizationLevel: 3,
     progressive: true,
     interlaced: true,
     svgoPlugins: [{removeViewBox: false}],
     use: [imageminPngquant()]
     }
     },

     rename: {
     options: {
     suffix: ".min"
     }
     }*/
};

// Локальный сервер
gulp.task('browser-sync', function () {
    return browserSync.init(plugins.browserSync.options);
});


gulp.task('build', function (cb) {
    return runSequence(
        [
           // 'stylus',
            'jade',
            'images',
            'plugins',
            'copy'
        ],
        cb
    );
});

/*

// Собираем Stylus
gulp.task('stylus', function() {
    return gulp.src(path.source.css)
        .pipe(plumber({
            errorHandler: errorHandler
        }))
        .pipe(stylint())
        .pipe(stylint.reporter({config: '.stylintrc'}))
        .pipe(stylus({
            use: [
                autoprefixer(plugins.autoprefixer.options)
            ]
        }))
        .pipe(cssbeautify(plugins.cssbeautify.options))
        .pipe(csscomb())
        .pipe(gulp.dest(path.dest.css))
        .pipe(browserSync.stream())
        .pipe(csso())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(path.dest.css));
});
*/

// Собираем html из Jade
gulp.task('jade', function() {
    return gulp.src('source/**/*.jade')
        .pipe(plumber({
            errorHandler: errorHandler
        }))
        .pipe(cached('jade'))
        .pipe(gulpif(global.isWatching, jadeInheritance({basedir: 'source'})))
        .pipe(filter(function (file) {
            return !/source[\\\/]blocks/.test(file.path);
        }))
        .pipe(jade(plugins.jade.options))
        .pipe(gulp.dest(path.dest.html));
});

// Копируем и минимизируем изображения
gulp.task('images', function() {
    return gulp.src(path.source.img)
        .pipe(plumber({
            errorHandler: errorHandler
        }))
        .pipe(newer(path.dest.img))
        .pipe(imagemin(plugins.imagemin.options))
        .pipe(gulp.dest(path.dest.img));
});

// Собираем JS
gulp.task('plugins', function() {
    return gulp.src(path.source.js)
        .pipe(plumber({
            errorHandler: errorHandler
        }))
        .pipe(include())
        .pipe(gulp.dest(path.dest.js))
        .pipe(uglify().on('error', gutil.log))
        .pipe(rename(plugins.rename.options))
        .pipe(gulp.dest(path.dest.js));
});

// Копируем файлы
gulp.task('copy', function() {
    return gulp.src(path.source.copy)
        .pipe(plumber({
            errorHandler: errorHandler
        }))
        .pipe(newer(path.dest.copy))
        .pipe(gulp.dest(path.dest.copy))
        .pipe(gulpFilter(['**/*.js', '!**/*.min.js']))
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(path.dest.css));
});
