require('./gs-loader')

var Promise = require('bluebird')
var TRACKER_NAME = 'resinAnalytics'

module.exports = function (gosquaredId, apiKey, debug) {
	loggedIn = false
	return {
		login: function (userId) {
			// automatically track pageviews in debug mode
			window._gs(gosquaredId, TRACKER_NAME, debug)

			if (debug) {
				window._gs(TRACKER_NAME + '.set', 'trackLocal', true);
			}

			if (userId) {
				window._gs(TRACKER_NAME + '.identify', {
					id: userId
				});
			}
			loggedIn = true
		},
		logout: function () {
			if (!loggedIn) return Promise.reject(new Error("gosquared logout called before login"))

			return Promise.fromCallback(function (callback) {
				window._gs(function() {
					window._gs(TRACKER_NAME + '.unidentify');
					loggedIn = false
					callback()
				})
			})
		},
		track: function (type, data) {
			if (!loggedIn) return Promise.reject(new Error("Can't record gosquared events without a login first"))

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
