var Promise = require('bluebird')
var assign = require('lodash/assign')
var pick = require('lodash/pick')

var ResinGaClient = require('resin-universal-ga')

module.exports = function (options) {
	var debug = options.debug,
		propertyId = options.gaId,
		site = options.gaSite

	if (!(propertyId && site)) {
		if (debug) {
			console.warn("`gaId` and/or `gaSite` are not set, GA tracking is disabled")
		}
		return null
	}

	var gaClient = ResinGaClient(propertyId, site)

	return {
		login: function(user) {
			return gaClient.login(user.id)
		},
		logout: function() {
			return gaClient.logout()
		},
		track: function (prefix, type, data) {
			return gaClient.track(site, type, prefix)
		}
	}
}
