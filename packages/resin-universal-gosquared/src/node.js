var Promise = require('bluebird')
var GoSquared = require('gosquared')

module.exports = function(gosquaredId, apiKey, debug) {
	var visitor = null
	function createVisitor(userId) {
		var gosquared = new GoSquared({
			api_key: apiKey,
			site_token: gosquaredId
		})
		if (userId) {
			visitor = gosquared.createPerson(userId)
		} else {
			vistor = gosquared
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
		track: function(type, data) {
			// if called before `login` create the object with the random ID
			createVisitor()
			return Promise.fromCallback(function (callback) {
				// node sdk doesn't support pageviews so no conditional here.
				// https://www.gosquared.com/docs/api/tracking/pageview/node/
				vistor.trackEvent(type, data, callback)
			})
		}
	}
}
