require('./ga-loader')

var Promise = require('bluebird')
var TRACKER_NAME = 'resinAnalytics'

module.exports = function (propertyId, site, debug) {
	var booted = false

	return {
		boot: function() {
			if (booted) return
			var options = {}

			if (debug) {
				options.cookieDomain = 'none'
			}

			window.ga('create', propertyId, site, TRACKER_NAME, options)
			booted = true
		},
		anonLogin: function () {
			this.boot()
		},
		login: function (userId) {
			this.boot()
			ga(TRACKER_NAME + '.set', 'userId', userId)
		},
		logout: function () {
			return Promise.fromCallback(function (callback) {
				window.ga(function() {
					if (booted) {
						window.ga.remove(TRACKER_NAME)
						booted = false
					}
					callback()
				})
			})
		},
		track: function (category, action, label, data) {
			this.boot()
			return Promise.fromCallback(function (callback) {
				var options = {
					hitCallback: callback
				}
				if (debug) {
					options.transport = 'xhr'
				}

				if (action === 'Page Visit') {
					window.ga(TRACKER_NAME + '.set', 'page', data.url || window.location.pathname)
					window.ga(TRACKER_NAME + '.send', 'pageview', data)
					// the hitCallback option isn't fired when calling hitType `pageview`
					// so we manually call callback()
					callback()
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
