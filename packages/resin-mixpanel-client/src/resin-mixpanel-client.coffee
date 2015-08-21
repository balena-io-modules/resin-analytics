((root, factory) ->
	if typeof define is 'function' and define.amd
		# AMD. Register as an anonymous module.
		define([ 'mixpanel-lib' ], factory)
	else if typeof exports is 'object'
		# Node. Does not work with strict CommonJS, but
		# only CommonJS-like enviroments that support module.exports,
		# like Node.
		module.exports = factory(require('mixpanel'))
) this, (mixpanelLib) ->
	return (token) ->
		mixpanel = mixpanelLib.init(token, track_pageview: false)

		userId = null
		return {
			isFrontend: typeof mixpanel.identify is 'function'

			signup: (userId, callback) ->
				if (this.isFrontend)
					mixpanel.alias(userId, userId)
					typeof callback is 'function' && callback()
				else
					mixpanel.alias(userId, userId, callback)

			login: (uid, callback) ->
				if (this.isFrontend)
					mixpanel.identify(uid)
				userId = uid
				typeof callback is 'function' && callback()

			logout: (callback) ->
				if (this.isFrontend)
					mixpanel.cookie?.clear()
				userId = null
				typeof callback is 'function' && callback()

			set: (props, callback) ->
				if (!this.isFrontend)
					return callback() # not supported in the backend version of mixpanel lib
				mixpanel.register(props)
				typeof callback is 'function' && callback()

			setOnce: (props, callback) ->
				if (!this.isFrontend)
					return callback()
				mixpanel.register_once(props)
				typeof callback is 'function' && callback()

			setUser: (prop, to, callback) ->
				if (this.isFrontend)
					mixpanel.people.set(prop, to, callback)
				else
					if (!userId)
						throw Error('(Resin Mixpanel Client) Please login() before using setUser()')
					mixpanel.people.set(userId, prop, to, callback)

			setUserOnce: (prop, to, callback) ->
				if (this.isFrontend)
					mixpanel.people.set_once(prop, to, callback)
				else
					if (!userId)
						throw Error('(Resin Mixpanel Client) Please login() before using setUserOnce()')
					mixpanel.people.set_once(userId, prop, to, callback)

			track: (event, properties, callback) ->
				mixpanel.track.apply(this, arguments)
		}