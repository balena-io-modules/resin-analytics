var mixpanelLib = require('mixpanel')

// normalize the API to match the one of the node module
module.exports = {
	init: function(token, options) {
		var mixpanel = mixpanelLib.init(token, options)
		return mixpanel
	}
}
