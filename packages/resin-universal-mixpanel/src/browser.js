require('./mixpanel-loader')

var mixpanel = window.mixpanel

// normalize the API to match the one of the node module
module.exports = {
	init: function() {
		mixpanel.init.apply(mixpanel, arguments)
		return mixpanel
	}
}
