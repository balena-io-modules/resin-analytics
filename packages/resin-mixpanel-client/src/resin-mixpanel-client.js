var mixpanelLib = require('resin-universal-mixpanel')

module.exports = function(token) {

	var mixpanel = mixpanelLib.init(token)
	var userId = null
	var isBrowser = typeof window !== 'undefined'

	mixpanel().set_config({
		track_pageview: false
	})

	// the browser mixpanel library calls the callback with the response object (in verbose mode)
	// or the status 0/1 in non-verbose mode
	// we normalize it here to match the node style and work with Promise.fromCallback
	function wrapCallback(callback) {
		if (!callback) return null
		return function(response) {
			if (response !== 1) return callback(new Error('Mixpanel error, code: ' + response))
			if (response.error) return callback(response.error)
			callback(null, response)
		}
	}

	return {
		signup: function(uid, callback) {
			if (isBrowser) {
				mixpanel().alias(uid, uid)
				if (typeof callback === "function") callback()
			} else {
				return mixpanel().alias(uid, uid, callback)
			}
		},
		login: function(uid, callback, setUserOnceCallback) {
			if (isBrowser) {
				// We uwse the optional (undocumented) params
				// https://github.com/mixpanel/mixpanel-js/blob/b4cf2c5cb900fbb102370c01553e9a70f4c6e2d0/src/mixpanel-core.js#L1331
				mixpanel().identify(
					uid,
					null, null, null, // _set_callback, _add_callback, _append_callback
					wrapCallback(setUserOnceCallback) // _set_once_callback
				)
			}
			userId = uid
			if (typeof callback === "function") callback()
		},
		logout: function(callback) {
			var ref
			if (isBrowser) {
				if ((ref = mixpanel().cookie) != null) {
					ref.clear()
				}
			}
			userId = null
			if (typeof callback === "function") callback()
		},
		set: function(props, callback) {
			if (isBrowser) {
				mixpanel().register(props)
			}

			if (typeof callback === "function") callback()
		},
		setOnce: function(props, callback) {
			if (isBrowser) {
				mixpanel().register_once(props)
			}

			if (typeof callback === "function") callback()
		},
		setUser: function(prop, to, callback) {
			var mp = mixpanel()

			if (isBrowser) {
				if (!callback && typeof to === 'function') {
					callback = wrapCallback(to)
					return mp.people.set(prop, callback)
				} else {
					callback = wrapCallback(callback)
					return mp.people.set(prop, to, callback)
				}
			} else {
				if (!userId) {
					throw new Error('(Resin Mixpanel Client) Please login() before using setUser()')
				}
				return mp.people.set(userId, prop, to, callback)
			}
		},
		setUserOnce: function(prop, to, callback) {
			var mp = mixpanel()

			if (isBrowser) {
				if (!callback && typeof to === 'function') {
					callback = wrapCallback(to)
					return mp.people.set_once(prop, callback)
				} else {
					callback = wrapCallback(callback)
					return mp.people.set_once(prop, to, callback)
				}
			} else {
				if (!userId) {
					throw new Error('(Resin Mixpanel Client) Please login() before using setUserOnce()')
				}
				return mp.people.set_once(userId, prop, to, callback)
			}
		},
		track: function(event, properties, callback) {
			var mp = mixpanel()

			if (isBrowser) {
				if (!callback && typeof properties === 'function') {
					callback = wrapCallback(properties)
					return mp.track(event, callback)
				} else {
					callback = wrapCallback(callback)
					return mp.track(event, properties, callback)
				}
			} else {
				properties.distinct_id = userId
				return mp.track(event, properties, callback)
			}
		}
	}

}
