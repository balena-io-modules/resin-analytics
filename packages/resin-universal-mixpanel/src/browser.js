require('./mixpanel-loader')

var Promise = require('bluebird')
var TRACKER_NAME = 'resinAnalytics'

// normalize the API to match the one of the node module
module.exports = {
	init: function(token) {
		return new Promise(function (resolve) {
			var mixpanel = window.mixpanel

			if (mixpanel[TRACKER_NAME]) {
				mixpanel.init(token, {}, TRACKER_NAME)
				resolve(mixpanel[TRACKER_NAME])
				return
			}

			mixpanel.init(token, {
				loaded: function() {
					resolve(window.mixpanel[TRACKER_NAME])
				}
			}, TRACKER_NAME)
		})
	}
}
