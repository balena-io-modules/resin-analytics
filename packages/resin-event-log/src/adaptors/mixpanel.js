var assign = require('lodash/assign')
var pick = require('lodash/pick')

var ResinMixpanelClient = require('resin-mixpanel-client')

var getMixpanelUser = function(userData) {
	var mixpanelUser = assign({
		'$email': userData.email,
		'$name': userData.username
	}, userData)
	return pick(mixpanelUser, [
		'$email',
		'$name',
		'$created',
		'hasPasswordSet',
		'iat',
		'id',
		'permissions',
		'public_key',
		'username'
	])
}

module.exports = function (options) {
	var debug = options.debug,
		token = options.mixpanelToken

	if (!token) {
		if (debug) {
			console.warn("`mixpanelToken` is not set, Mixpanel tracking is disabled")
		}
		return null
	}

	var mixpanel = ResinMixpanelClient(token)

	return {
		login: function(user) {
			var mixpanelUser = getMixpanelUser(user)
			var methodName = mixpanelUser.$created ? 'signup' : 'login'

			return mixpanel[methodName](user.username)
				.then(function() {
					return mixpanel.setUserOnce(mixpanelUser)
				})
		},
		logout: function() {
			return mixpanel.logout()
		},
		track: function (prefix, type, data) {
			return mixpanel.track("[" + prefix + "] " + type, data)
		}
	}
}
