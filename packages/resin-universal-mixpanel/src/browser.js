var mixpanel = require('mixpanel-browser')

var TRACKER_NAME = 'resinAnalytics'

// normalize the API to match the one of the node module
module.exports = {
	init: function(token) {
		mixpanel.init(token, {}, TRACKER_NAME)
		return mixpanel[TRACKER_NAME]
	}
}
