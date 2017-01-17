var Promise = require('bluebird')
var mixpanelLib = require('resin-universal-mixpanel')

module.exports = function(token) {

	var mixpanel = mixpanelLib.init(token)
	var userId = null
	var isBrowser = typeof window !== 'undefined'

	mixpanel.then(function (mp) {
		mp.set_config({
			track_pageview: false
		})
	})

	// the browser mixpanel library calls the callback with the response object (in verbose mode)
	// or the status 0/1 in non-verbose mode
	// we normalize it here to match the node style and work with Promise.fromCallback
	function wrapBrowserCallback(callback) {
		if (!callback) return null
		return function(response) {
			if (typeof response === 'number' && response !== 1) {
				return callback(new Error('Mixpanel error: ' + response))
			}
			if (response.error) {
				return callback(response.error)
			}
			callback(null, response)
		}
	}

	return {
		signup: function(uid) {
			var self = this

			return mixpanel.then(function(mp) {
				return Promise.fromCallback(function(callback) {
					if (isBrowser) {
						callback = wrapBrowserCallback(callback)
						return callback(mp.alias(uid))
					}

					mp.alias(uid, uid, callback)
				})
			}).then(function() {
				// calling `login` from here is the only way to ensure
				// `identify` is called before continuing to tracking
				return self.login(uid)
			})
		},
		login: function(uid) {
			userId = uid

			if (isBrowser) {
				return mixpanel.then(function(mp) {
					mp.identify(uid)
				})
			}

			return Promise.resolve()
		},
		logout: function() {
			userId = null

			if (isBrowser) {
				return mixpanel.then(function(mp) {
					mp.reset()
				})
			}

			return Promise.resolve()
		},
		set: function(props) {
			if (isBrowser) {
				return mixpanel.then(function(mp) {
					mp.register(props)
				})
			}

			return Promise.resolve()
		},
		setOnce: function(props) {
			if (isBrowser) {
				return mixpanel.then(function(mp) {
					mp.register_once(props)
				})
			}

			return Promise.resolve()
		},
		setUser: function(props) {
			return mixpanel.then(function(mp) {
				return Promise.fromCallback(function(callback) {
					if (isBrowser) {
						callback = wrapBrowserCallback(callback)
						return mp.people.set(props, callback)
					}

					if (!userId) {
						throw new Error('(Resin Mixpanel Client) Please login() before using setUser()')
					}
					return mp.people.set(userId, props, callback)
				})
			})
		},
		setUserOnce: function(props) {
			return mixpanel.then(function(mp) {
				return Promise.fromCallback(function(callback) {
					if (isBrowser) {
						callback = wrapBrowserCallback(callback)
						return mp.people.set_once(props, callback)
					}

					if (!userId) {
						throw new Error('(Resin Mixpanel Client) Please login() before using setUserOnce()')
					}
					return mp.people.set_once(userId, props, callback)
				})
			})
		},
		track: function(event, props) {
			return mixpanel.then(function(mp) {
				return Promise.fromCallback(function(callback) {
					if (isBrowser) {
						callback = wrapBrowserCallback(callback)
					} else {
						props.distinct_id = userId
					}
					return mp.track(event, props, callback)
				})
			})
		}
	}

}
