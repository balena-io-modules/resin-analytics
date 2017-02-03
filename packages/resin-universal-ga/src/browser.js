require('./ga-loader')

// var ga = window.ga

var TRACKER_NAME = 'resinAnalytics'

module.exports = function (propertyId, site, debug) {
	return {
		login: function (userId) {
			var options = {
				userId: userId
			}
			if (debug) {
				options.cookieDomain = 'none'
			}
			window.ga('create', propertyId, site, TRACKER_NAME, options)
		},
		logout: function () {
			window.ga(function() {
				window.ga.remove(TRACKER_NAME)
			})
		},
		track: function (category, action, label) {
			window.ga(
				TRACKER_NAME + '.send', 'event',
				category, action, label,
				debug
					? { transport: 'xhr' }
					: null
			)
		}
	}
}
