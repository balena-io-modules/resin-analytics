var mixpanelLib = require('mixpanel')
module.exports = function(token) {

	var mixpanel = mixpanelLib.init(token)
	var userId = null
	var isBrowser = typeof window !== 'undefined'

	mixpanel.set_config({
		track_pageview: false
	})

	return {
		signup: function(uid, callback) {
			if (isBrowser) {
				mixpanel.alias(uid, uid)
				if (typeof callback === "function") callback()
			} else {
				return mixpanel.alias(uid, uid, callback)
			}
		},
		login: function(uid, callback) {
			if (isBrowser) {
				mixpanel.identify(uid)
			}
			userId = uid
			if (typeof callback === "function") callback()
		},
		logout: function(callback) {
			var ref
			if (isBrowser) {
				if ((ref = mixpanel.cookie) != null) {
					ref.clear()
				}
			}
			userId = null
			if (typeof callback === "function") callback()
		},
		set: function(props, callback) {
			if (!isBrowser) {
				if (typeof callback === "function") callback()
			}
			mixpanel.register(props)
			if (typeof callback === "function") callback()
		},
		setOnce: function(props, callback) {
			if (!isBrowser) {
				if (typeof callback === "function") callback()
			}
			mixpanel.register_once(props)
			if (typeof callback === "function") callback()
		},
		setUser: function(prop, to, callback) {
			if (isBrowser) {
				return mixpanel.people.set(prop, to, callback)
			} else {
				if (!userId) {
					throw new Error('(Resin Mixpanel Client) Please login() before using setUser()')
				}
				return mixpanel.people.set(userId, prop, to, callback)
			}
		},
		setUserOnce: function(prop, to, callback) {
			if (isBrowser) {
				return mixpanel.people.set_once(prop, to, callback)
			} else {
				if (!userId) {
					throw new Error('(Resin Mixpanel Client) Please login() before using setUserOnce()')
				}
				return mixpanel.people.set_once(userId, prop, to, callback)
			}
		},
		track: function(event, properties, callback) {
			if (!isBrowser) {
				properties.distinct_id = userId
			}
			return mixpanel.track(event, properties, callback)
		}
	}

}
