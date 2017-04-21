karmaConfig = require('resin-config-karma')
packageJSON = require('./package.json')

module.exports = function (config) {
	karmaConfig.logLevel = config.LOG_DEBUG
	karmaConfig.sauceLabs = {
		testName: packageJSON.name + ' v' + packageJSON.version
	}
	// debugging
	// karmaConfig.browsers = ['PhantomJS_custom'],
	// karmaConfig.customLaunchers = {
  //   'PhantomJS_custom': {
  //     base: 'PhantomJS',
  //     options: {
	// 			onResourceRequested: function(request) {
	// 				if (request.url.indexOf('localhost') < 0) {
	// 					console.log('Request ' + JSON.stringify(request, undefined, 4));
	// 				}
	// 			}
  //     },
  //     flags: ['--load-images=true'],
  //     debug: true
  //   }
  // }
	// karmaConfig.browserConsoleLogOptions = {
	// 	level: 'log',
	// 	terminal: true
	// }
	karmaConfig.client = {
		captureConsole: true
	}
	karmaConfig.preprocessors['test/**/*.js'] = [ 'browserify' ]
	karmaConfig.files = [
		'test/*.spec.js'
	]
	karmaConfig.phantomjsLauncher = {
      // Have phantomjs exit if a ResourceError is encountered (useful if karma exits without killing phantom)
      exitOnResourceError: true
  }
	config.set(karmaConfig)
}
