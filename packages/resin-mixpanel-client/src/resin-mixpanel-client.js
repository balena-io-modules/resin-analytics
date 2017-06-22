var Promise = require('bluebird')
var mixpanelLib = require('resin-universal-mixpanel')

module.exports = function(token, options) {

	var mixpanel = mixpanelLib.init(token, options)
	var isBrowser = typeof window !== 'undefined'

	mixpanel.set_config({
		track_pageview: false
	})

	// the browser mixpanel library calls the callback with the response object (in verbose mode)
	// or the status 0/1/-1 in non-verbose mode
	// we normalize it here to match the node style and work with Promise.fromCallback
	function wrapBrowserCallback(callback) {
		if (!callback) return null
		return function(response) {
			if (typeof response === 'number' && response !== 1) {
				return callback(new Error('Mixpanel error: ' + response))
			}
			if (response && response.error) {
				return callback(response.error)
			}
			callback(null, response)
		}
	}

	// Like Promise.fromCallback, but handling mixpanel's crazy
	// callback format if required (if we're in a browser)
	function mixpanelToPromise(callbackBasedFunction) {
		return Promise.fromCallback(function (callback) {
			if (isBrowser) {
				callbackBasedFunction(wrapBrowserCallback(callback))
			} else {
				callbackBasedFunction(callback)
			}
		})
	}

	var self = {
		signup: function(uid) {
			return mixpanelToPromise(function (callback) {
				if (isBrowser) {
					callback(mixpanel.alias(uid))
				} else {
					mixpanel.alias(uid, uid, callback)
				}
			}).then(function() {
				// calling `login` from here is the only way to ensure
				// `identify` is called before continuing to tracking
				return self.login(uid)
			})
		},
		login: function(uid) {
			self.userId = uid

			return mixpanelToPromise(function (callback) {
				if (isBrowser) {
					mixpanel.identify(uid)
					callback()
				} else {
					mixpanel.people.set_once(uid, { '$distinct_id': uid }, callback)
				}
			})
		},
		logout: function() {
			self.userId = null

			return mixpanelToPromise(function (callback) {
				if (isBrowser) {
					callback(mixpanel.reset())
				} else {
					// Node module has no state, so no-op.
					callback(null, true)
				}
			})
		},
		setUser: function(props) {
			return mixpanelToPromise(function(callback) {
				if (!self.userId) {
					throw new Error('(Resin Mixpanel Client) Please login() before using setUser()')
				}

				if (isBrowser) {
					mixpanel.people.set(props, callback)
				} else {
					mixpanel.people.set(self.userId, props, callback)
				}
			})
		},
		setUserOnce: function(props) {
			return mixpanelToPromise(function(callback) {
				if (!self.userId) {
					throw new Error('(Resin Mixpanel Client) Please login() before using setUserOnce()')
				}

				if (isBrowser) {
					mixpanel.people.set_once(props, callback)
				} else {
					mixpanel.people.set_once(self.userId, props, callback)
				}
			})
		},
		track: function(event, props) {
			return mixpanelToPromise(function(callback) {
				if (!isBrowser && self.userId) {
					props.distinct_id = self.userId
				}

				return mixpanel.track(event, props, callback)
			})
		}
	}

	return self
}
