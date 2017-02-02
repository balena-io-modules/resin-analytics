require('./ga-loader')

// var ga = window.ga

var TRACKER_NAME = 'resinAnalytics'

module.exports = function (propertyId, site) {
	return {
		login: function (userId) {
			window.ga('create', propertyId, site, TRACKER_NAME, {
				userId: userId
			})
		},
		logout: function () {
			window.ga(function() {
				window.ga.remove(TRACKER_NAME)
			})
		},
		track: function (category, action, label) {
			window.ga(
				TRACKER_NAME + '.send', 'event',
				category, action, label
			)
		}
	}
}
