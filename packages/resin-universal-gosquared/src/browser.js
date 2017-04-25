require('./gs-loader')

var Promise = require('bluebird')
var TRACKER_NAME = 'resinAnalytics'

module.exports = function (gosquaredId, apiKey, debug) {
	var loggedIn = false

	return {
		login: function (userId) {
			window._gs(gosquaredId, TRACKER_NAME, debug)
			window._gs(TRACKER_NAME + '.set', 'trackLocal', debug)

			if (userId) {
				window._gs(TRACKER_NAME + '.identify', {
					id: userId
				})
				loggedIn = true
			}
		},
		logout: function () {
			if (!loggedIn && debug) console.warn('GA: logout called when no user is logged in.')

			return Promise.fromCallback(function (callback) {
				window._gs(function() {
					window._gs(TRACKER_NAME + '.unidentify')
					loggedIn = false
					callback()
				})
			})
		},
		track: function (type, data) {
			return Promise.fromCallback(function (callback) {
				if (type === 'Page Visit') {
					window._gs(TRACKER_NAME + '.track', data.url || window.location.pathname)
				} else {
					window._gs(TRACKER_NAME + '.event', type, data)
				}
				callback()
			})
		},
	}
}
