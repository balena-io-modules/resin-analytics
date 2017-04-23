karmaConfig = require('resin-config-karma')
packageJSON = require('./package.json')
var _ = require('lodash')

module.exports = function (config) {
	karmaConfig.logLevel = config.LOG_DEBUG
	karmaConfig.sauceLabs = {
		testName: packageJSON.name + ' v' + packageJSON.version
	}
	karmaConfig.browsers = ['PhantomJS_custom'],
	karmaConfig.customLaunchers = {
    'PhantomJS_custom': {
      base: 'PhantomJS',
      options: {
				onPageCreated: function (newPage) {
					var resources = []
					newPage.onResourceRequested = function(requestData, networkRequest) {
						resources.push(requestData)
						return(requestData, networkRequest)
					}
					newPage.onCallback = function () {
						return resources
	        }
					return newPage
	      }
      },
      flags: ['--load-images=true'],
      debug: true
    }
  }
	karmaConfig.browserConsoleLogOptions = {
		level: 'log',
		terminal: true
	}
	karmaConfig.client = {
		captureConsole: true,
		useIframe: false
	}
	karmaConfig.preprocessors['test/**/*.js'] = [ 'browserify' ]
	karmaConfig.files = [
		'test/*.spec.js'
	]
	config.set(karmaConfig)
}
