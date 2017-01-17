var Promise = require('bluebird')
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
			console.warn("`mixpanelToken` is not set, mixpanel tracking is didabled")
		}
		return null
	}

	var mixpanel = ResinMixpanelClient(token)

	return {
		login: function(user) {
			var mixpanelUser = getMixpanelUser(user)

			return Promise.fromCallback(function (callback) {
				var login = function() {
					mixpanel.login(user.username, function() {
						mixpanel.setUserOnce(mixpanelUser, callback)
					})
				}

				if (mixpanelUser.$created) {
					mixpanel.signup(user.username, function() {
						login()
					})
				} else {
					login()
				}

			})
		},
		logout: function() {
			return Promise.fromCallback(function (callback) {
				mixpanel.logout(callback)
			})
		},
		track: function (type, data) {
			return Promise.fromCallback(function (callback) {
				mixpanel.track(type, data, callback)
			})
		}
	}
}
