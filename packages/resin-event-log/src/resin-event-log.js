var ResinMixpanelClient = require('resin-mixpanel-client')
var _ = require('lodash')

var EVENTS = {
	user: ['login', 'logout', 'signup', 'passwordCreate', 'passwordEdit', 'emailEdit'],
	publicKey: ['create', 'delete'],
	application: ['create', 'open', 'delete', 'osDownload'],
	environmentVariable: ['create', 'edit', 'delete'],
	device: ['open', 'rename', 'delete', 'terminalOpen', 'terminalClose'],
	deviceEnvironmentVariable: ['create', 'edit', 'delete']
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

	hooks = _.defaults(hooks, HOOKS)

	var mixpanel = ResinMixpanelClient(mixpanelToken)

	var getMixpanelUser = function(userData) {
		var mixpanelUser
		mixpanelUser = _.assign({
			'$email': userData.email,
			'$name': userData.username
		}, userData)
		return _.pick(mixpanelUser, ['$email', '$name', '$created', 'hasPasswordSet', 'iat', 'id', 'permissions', 'public_key', 'username'])
	}

	var exported = {
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
			return hooks.beforeCreate.call(this, type, jsonData, applicationId, deviceId, function() {
					return mixpanel.track("[" + _this.subsystem + "] " + type, {
						applicationId: applicationId,
						deviceId: deviceId,
						jsonData: jsonData
					}, function() {
						return hooks.afterCreate.call(_this, type, jsonData, applicationId, deviceId)
					})
			})
		}
	}
	_.forEach(EVENTS, function(events, base) {
		if (exported[base] == null) {
			exported[base] = {}
		}
		return _.forEach(events, function(event) {
			return exported[base][event] = function(jsonData, applicationId, deviceId) {
				if (applicationId == null) {
					applicationId = null
				}
				if (deviceId == null) {
					deviceId = null
				}
				return exported.create(_.startCase(base + " " + event), jsonData, applicationId, deviceId)
			}
		})
	})
	return exported
}
