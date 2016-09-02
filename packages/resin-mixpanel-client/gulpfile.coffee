gulp = require('gulp')
gutil = require('gulp-util')
coffee = require('gulp-coffee')

OPTIONS =
	files:
		coffee: [ 'src/*.coffee' ]
		app: 'src/*.coffee'
		javascript: 'bin/*.js'
	directories:
		build: './bin'

gulp.task 'coffee', ->
	gulp.src(OPTIONS.files.app)
		.pipe(coffee()).on('error', gutil.log)
		.pipe(gulp.dest(OPTIONS.directories.build))

gulp.task 'build', [ 'coffee' ]

gulp.task 'watch', [ 'build' ], ->
	gulp.watch([ OPTIONS.files.coffee ], [ 'build' ])