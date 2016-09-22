'use strict';
//npm gulp gulp-jade gulp-stylus autoprefixer-stylus gulp-imagemin browser-sync gulp-cssbeautify gulp-util install gulp-imagemin browser-sync gulp-cssbeautify gulp-util gulp-newer gulp-include gulp-rename gulp-uglify imagemin-pngquant gulp-csscomb gulp-csso gulp-filter gulp-plumber del gulp-jade-inheritance gulp-if gulp-cached gulp-changed gulp-filter gulp-stylint

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
    // runSequence = require('run-sequence'),
    // watch = require('gulp-watch'),
    // gulpZip = require('gulp-zip'),
    // nodePath = require('path'),
    jadeInheritance = require('gulp-jade-inheritance'),
    gulpif = require('gulp-if'),
    cached = require('gulp-cached'),
    changed = require('gulp-changed'),
    filter = require('gulp-filter'),
    stylint = require('gulp-stylint');

var errorHandler = function(err) {
    gutil.log([(err.name + ' in ' + err.plugin).bold.red, '', err.message, ''].join('\n'));

    if (gutil.env.beep) {
        gutil.beep();
    }

    this.emit('end');
};

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
    ,

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
    }
};

// Пути к файлам
var path = {
    source: {
        html: [
            config.path.source + '/**/*.jade',
            '!' + config.path.source + '/' + config.path.partials + '/**/*.jade'
        ],
        css: [
            config.path.source + '/**/*.styl',
            '!' + config.path.source + '/**/_*.styl',
            '!' + config.path.source + '/' + config.path.css + '/lib/**/*.styl'
        ],
        img: config.path.source + '/' + config.path.images + '/**/*.{jpg,jpeg,png,gif,svg}',
        js: config.path.source + '/' + config.path.js + '/**/*.js',
        copy: config.path.assets + '/**/*'
    },

    dest: {
        html: config.path.dist,
        css: config.path.dist,
        img: config.path.dist + '/' + config.path.images,
        js: config.path.dist + '/' + config.path.js,
        copy: config.path.dist
    },

    watch: {
        html: config.path.source + '/**/*.jade',
        css: config.path.source + '/**/*.styl',
        img: config.path.source + '/' + config.path.images + '/**/*.{jpg,jpeg,png,gif,svg}',
        js: config.path.source + '/**/*.js',
        copy: config.path.assets + '/**/*'
    }
};

// Локальный сервер
gulp.task('browser-sync', function () {
    return browserSync.init(plugins.browserSync.options);
});


gulp.task('build', function (cb) {
    return runSequence(
        [
            'stylus',
            'jade',
            'images',
            'plugins',
            'copy'
        ],
        cb
    );
});


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

// Собираем html из Jade
gulp.task('jade', function () {
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
gulp.task('images', function () {
    return gulp.src(path.source.img)
        .pipe(plumber({
            errorHandler: errorHandler
        }))
        .pipe(newer(path.dest.img))
        .pipe(imagemin(plugins.imagemin.options))
        .pipe(gulp.dest(path.dest.img));
});

// Собираем JS
gulp.task('plugins', function () {
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
gulp.task('copy', function () {
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


// Отчистка папки public
gulp.task('cleanup', function (cb) {
    return del(config.path.dist + '/*', cb);
});
