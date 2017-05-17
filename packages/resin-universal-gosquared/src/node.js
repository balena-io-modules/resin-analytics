var Promise = require('bluebird')
var GoSquared = require('gosquared')

module.exports = function(gosquaredId, apiKey, debug) {
	var visitor = null
	function createVisitor(userId) {
		if (visitor) return visitor
		var gosquared = new GoSquared({
			api_key: apiKey,
			site_token: gosquaredId
		})
		if (userId) {
			visitor = gosquared.createPerson(userId);
		} else {
			visitor = gosquared
		}
	}
	function destroyVisitor() {
		visitor = null
	}
	return {
		login: function(userId) {
			createVisitor(userId)
		},
		logout: function() {
			destroyVisitor()
		},
		track: function(prefix, type, data) {
			// if called before `login` create an event without user attached.
			createVisitor()
			return Promise.fromCallback(function (callback) {
				// node sdk doesn't support pageviews so no conditional here.
				// https://www.gosquared.com/docs/api/tracking/pageview/node/
				visitor.trackEvent('[' + prefix + '] ' + type, data, callback)
			})
		}
	}
}
