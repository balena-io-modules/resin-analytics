require('./ga-loader')

var ga = window.ga

var TRACKER_NAME = 'resinAnalytics'

module.exports = function (propertyId, site) {
	return {
		login: function (userId) {
			ga('create', propertyId, site, TRACKER_NAME, {
				userId: userId
			})
		},
		logout: function () {
			ga(function() {
				ga.remove(TRACKER_NAME)
			})
		},
		track: function (category, action, label) {
			ga(
				TRACKER_NAME + '.send', 'event',
				category, action, label
			)
		}
	}
}
