var Promise = require('bluebird')
var ua = require('universal-analytics')

module.exports = function(propertyId, site, debug) {
	var ga = null

	return {
		boot: function() {
			if (ga) return
			ga = ua(propertyId, {
				strictCidFormat: false,
				https: true
			})

			if (debug) {
				ga = ga.debug()
			}
		},
		anonLogin: function(userId) {
			this.boot()
		},
		login: function(userId) {
			this.boot()
			ga.set('uid', userId)
		},
		logout: function() {
			ga = null
		},
		track: function(category, action, label) {
			// if called before `login` create the object with the random ID
			this.boot()
			return Promise.fromCallback(function (callback) {
				ga.event(category, action, label, undefined, callback)
			})
		}
	}
}
