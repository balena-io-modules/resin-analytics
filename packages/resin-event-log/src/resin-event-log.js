var ResinMixpanelClient = require('resin-mixpanel-client')
var assign = require('lodash/assign')
var pick = require('lodash/pick')
var startCase = require('lodash/startCase')

var EVENTS = {
	user: [ 'login', 'logout', 'signup', 'passwordCreate', 'passwordEdit', 'emailEdit' ],
	publicKey: [ 'create', 'delete' ],
	application: [ 'create', 'open', 'delete', 'osDownload' ],
	environmentVariable: [ 'create', 'edit', 'delete' ],
	device: [ 'open', 'rename', 'delete', 'terminalOpen', 'terminalClose' ],
	deviceEnvironmentVariable: [ 'create', 'edit', 'delete' ]
}

var HOOKS = {
	beforeCreate: function(type, jsonData, applicationId, deviceId, callback) {
		return callback()
	},
	afterCreate: function(type, jsonData, applicationId, deviceId) {}
}

module.exports = function(mixpanelToken, subsystem, hooks) {
	if (!mixpanelToken || !subsystem) {
		throw Error('mixpanelToken and subsystem are required to start events interaction.')
	}

	hooks = assign({}, HOOKS, hooks)

	var mixpanel = ResinMixpanelClient(mixpanelToken)

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

	var eventLog = {
		userId: null,
		subsystem: subsystem,
		start: function(user, callback) {
			if (!user) {
				throw Error('user is required to start events interaction.')
			}

			this.userId = user.id
			var mixpanelUser = getMixpanelUser(user)
			var login = function() {
				return mixpanel.login(user.username, function() {
					return mixpanel.setUserOnce(mixpanelUser, callback)
				})
			}
			if (mixpanelUser.$created) {
				return mixpanel.signup(user.username, function() {
					return login()
				})
			}
			return login()
		},
		end: function(callback) {
			this.userId = null
			return mixpanel.logout(callback)
		},
		create: function(type, jsonData, applicationId, deviceId) {
			var _this = this
			hooks.beforeCreate.call(this, type, jsonData, applicationId, deviceId, function() {
				return mixpanel.track("[" + _this.subsystem + "] " + type, {
					applicationId: applicationId,
					deviceId: deviceId,
					jsonData: jsonData
				}, function() {
					hooks.afterCreate.call(_this, type, jsonData, applicationId, deviceId)
				})
			})
		}
	}

	for (var base in EVENTS) {
		var events = EVENTS[base]
		var obj = eventLog[base] = {}
		events.forEach(function(event) {
			obj[event] = function(jsonData, applicationId, deviceId) {
				return eventLog.create(startCase(base + " " + event), jsonData, applicationId, deviceId)
			}
		})
	}

	return eventLog
}
