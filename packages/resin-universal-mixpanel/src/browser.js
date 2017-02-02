require('./mixpanel-loader')

// normalize the API to match the one of the node module
module.exports = {
	init: function() {
		window.mixpanel.init.apply(window.mixpanel, arguments)
		// we have to wrap it into a getter because in the browser the global instance is replaced when the lib is loaded
		return function () {
			return window.mixpanel
		}
	}
}
