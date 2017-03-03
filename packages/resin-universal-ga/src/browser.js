require('./ga-loader')

var Promise = require('bluebird')
var TRACKER_NAME = 'resinAnalytics'

module.exports = function (propertyId, site, debug) {
	loggedIn = false;

	return {
		login: function (userId) {
			var options = {
				userId: userId
			}
			if (debug) {
				options.cookieDomain = 'none'
			}
			window.ga('create', propertyId, site, TRACKER_NAME, options)
			loggedIn = true;
		},
		logout: function () {
			if (!loggedIn) throw new Error("Can't record GA logout event before login");

			return Promise.fromCallback(function (callback) {
				window.ga(function() {
					window.ga.remove(TRACKER_NAME)
					loggedIn = false;
					callback()
				})
			})
		},
		track: function (category, action, label) {
			if (!loggedIn) throw new Error("Can't record GA events without a login first");

			return Promise.fromCallback(function (callback) {
				var options = {
					hitCallback: callback
				}
				if (debug) {
					options.transport = 'xhr'
				}
				window.ga(
					TRACKER_NAME + '.send', 'event',
					category, action, label,
					options
				)
			}).timeout(1000);
		}
	}
}
