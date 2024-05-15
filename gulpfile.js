const {src,dest,series,watch}=require ('gulp');
const concat = require ('gulp-concat');
const htmlmin = require('gulp-htmlmin');
const autoprefixes = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const svgSprite = require ('gulp-svg-sprite');
const image = require ('gulp-image');
const sass = require ('gulp-sass')(require('sass'));

// import image from 'gulp-image';
const uglify = require ('gulp-uglify-es').default;
const babel = require ('gulp-babel');
const  notify  = require('gulp-notify');
const  sourcemaps  = require('gulp-sourcemaps');
const  del  = require('del');
const gulpif = require('gulp-if');
const browserSync = require('browser-sync').create();

// Определим переменную окружения, которая будет равна 'production' на prod-версии
// const env = process.env.NODE_ENV || 'development';
const prod = process.argv.includes('--production');
const dev = process.argv.includes('--dev');


console.log(prod);
console.log(dev);

const clean =()=>{
    return del(['dist'])
}

const resources =()=>{
    return src('src/resources/**')
    .pipe(dest('dist/resources'))
}
// gulpif(env === 'production', sourcemaps.init())

const styles= ()=>{
   return src('./src/styles/**/*.scss')
   .pipe(gulpif(dev, sourcemaps.init()))
   .pipe(sass().on('error', sass.logError))
   .pipe(concat('main.css'))
   .pipe(autoprefixes({
        cascade:false
    }))
    .pipe(cleanCSS({
        level:2
    }))
    .pipe(sourcemaps.write())
    .pipe(dest('dist'))
    .pipe(browserSync.stream())
}

// htmlmin({collapseWhitespace:true})
// gulpif(prod, htmlmin({collapseWhitespace:true}))

const htmlMinify=()=>{
    return src('src/**/*.html')
    .pipe( gulpif(prod, htmlmin({collapseWhitespace:true})) )
    .pipe(dest('dist'))
    .pipe(browserSync.stream())
}

const svgSprites=()=>{
    return src('src/images/svg/**/*.svg')
    .pipe(svgSprite({
        mode:{
            stack:{
                sprite:'../sprite.svg'
            }
        }
    }))
    .pipe(dest('dist/images'))
}

// gulpif(prod, uglify({toplevel: true}).on('error', notify.onError()))
    // uglify({toplevel: true}).on('error', notify.onError())

const scripts=()=>{
    return src([
        'src/js/components/**/*.js',
        'src/js/main.js'
    ])
    .pipe(gulpif(dev, sourcemaps.init()))
    .pipe(babel({
        presets:['@babel/env']
    }))
    .pipe(concat('app.js'))
    .pipe(gulpif(prod, uglify({toplevel: true}).on('error', notify.onError())))
    .pipe(sourcemaps.write())
    .pipe(dest('dist'))
    .pipe(browserSync.stream())
}

const watchFiles=()=>{
    browserSync.init({
        server:{
            baseDir:'dist'
        }
    })
}

const images=()=>{
    return src([
        'src/images/**/*.jpg',
        'src/images/**/*.png',
        'src/images/*.svg',
        'src/images/**/*.jpeg',
    ])
    .pipe(image())
    .pipe(dest('dist/images'))
}

watch('src/**/*.html', htmlMinify)
watch('src/styles/**/*.scss', styles)
watch('src/images/svg/**/*.svg', svgSprite)
watch('src/js/**/*.js', scripts)
watch('src/resources/**', resources)

// exports.clean=clean

exports.styles=styles
exports.scripts=scripts
exports.htmlMinify=htmlMinify
exports.default=series(clean,resources, htmlMinify, scripts, styles, images, svgSprites, watchFiles);
