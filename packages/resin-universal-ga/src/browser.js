require('./ga-loader')

var Promise = require('bluebird')
var TRACKER_NAME = 'resinAnalytics'

module.exports = function (propertyId, site, debug) {
	var loggedIn = false

	return {
		login: function (userId) {
			var options = {
				userId: userId
			}
			if (debug) {
				options.cookieDomain = 'none'
			}
			window.ga('create', propertyId, site, TRACKER_NAME, options)
			if (userId) {
				loggedIn = true
			}
		},
		logout: function () {
			if (!loggedIn && debug) console.warn('GA: logout called when no user is logged in.')

			return Promise.fromCallback(function (callback) {
				window.ga(function() {
					window.ga.remove(TRACKER_NAME)
					loggedIn = false
					callback()
				})
			})
		},
		track: function (category, action, label, data) {
			return Promise.fromCallback(function (callback) {
				var options = {
					hitCallback: callback
				}
				var hitType = 'event'
				if (debug) {
					options.transport = 'xhr'
				}

				if (action === 'Page Visit') {
					window.ga(TRACKER_NAME + '.set', 'page', data.url || window.location.pathname);
					window.ga(TRACKER_NAME + '.send', 'pageview', options)
				} else {
					window.ga(
						TRACKER_NAME + '.send', 'event',
						category, action, label,
						options
					)
				}

			}).timeout(1000)
		}
	}
}
