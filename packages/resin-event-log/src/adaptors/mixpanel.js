var Promise = require('bluebird')
var assign = require('lodash/assign')
var pick = require('lodash/pick')

var ResinMixpanelClient = require('resin-mixpanel-client')

var isBrowser = typeof window !== 'undefined'

function getMixpanelUser(userData) {
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

function getSignupOrLoginMethodName(isNewUser) {
	return isNewUser ? 'signup' : 'login'
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

			return Promise.fromCallback(function (callback) {
				var signupOrLogin

				if (isBrowser) {
					// In the browser the `people.set_once` will return -1 if called right after `identify`
					signupOrLogin = function (isNewUser) {
						mixpanel[getSignupOrLoginMethodName(isNewUser)](user.username, function() {
							mixpanel.setUserOnce(mixpanelUser)
						}, callback /* setUserOnceCallback */)
					}
				} else {
					signupOrLogin = function (isNewUser) {
						mixpanel[getSignupOrLoginMethodName(isNewUser)](user.username, function() {
							mixpanel.setUserOnce(mixpanelUser, callback)
						})
					}
				}

				signupOrLogin(mixpanelUser.$created)
			})
		},
		logout: function() {
			return Promise.fromCallback(function (callback) {
				mixpanel.logout(callback)
			})
		},
		track: function (prefix, type, data) {
			return Promise.fromCallback(function (callback) {
				mixpanel.track("[" + prefix + "] " + type, data, callback)
			})
		}
	}
}
