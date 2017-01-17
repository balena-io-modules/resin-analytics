var Promise = require('bluebird')
var ua = require('universal-analytics')

module.exports = function(propertyId, site) {
	var visitor = null
	function createVisitor(userId) {
		if (visitor) return visitor
		return visitor = ua(propertyId, userId, {
			strictCidFormat: false,
			https: true
		})
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
		track: function(category, action, label) {
			// if called before `login` create the object with the random ID
			createVisitor()
			return Promise.fromCallback(function (callback) {
				visitor.event(category, action, label, undefined, callback)
			})
		}
	}
}

