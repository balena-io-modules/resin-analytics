((root, factory) ->
	if typeof define is 'function' and define.amd
		# AMD. Register as an anonymous module.
		define([ ], -> factory(window.mixpanel))
	else if typeof exports is 'object'
		# Node. Does not work with strict CommonJS, but
		# only CommonJS-like enviroments that support module.exports,
		# like Node.
		module.exports = factory(require('mixpanel'))
) this, (mixpanelLib) ->
	return (token) ->
		mixpanel = mixpanelLib.init(token) or window.mixpanel
		mixpanel.set_config(track_pageview: false)

		userId = null
		return {
			isFrontend: typeof mixpanel.identify is 'function'

			signup: (uid, callback) ->
				if @isFrontend
					mixpanel.alias(uid, uid)
					callback?()
				else
					mixpanel.alias(uid, uid, callback)

			login: (uid, callback) ->
				if @isFrontend
					mixpanel.identify(uid)
				userId = uid
				callback?()

			logout: (callback) ->
				if @isFrontend
					mixpanel.cookie?.clear()
				userId = null
				callback?()

			set: (props, callback) ->
				if !@isFrontend
					return callback?() # not supported in the backend version of mixpanel lib
				mixpanel.register(props)
				callback?()

			setOnce: (props, callback) ->
				if !@isFrontend
					return callback?()
				mixpanel.register_once(props)
				callback?()

			setUser: (prop, to, callback) ->
				if @isFrontend
					mixpanel.people.set(prop, to, callback)
				else
					if !userId
						throw new Error('(Resin Mixpanel Client) Please login() before using setUser()')
					mixpanel.people.set(userId, prop, to, callback)

			setUserOnce: (prop, to, callback) ->
				if @isFrontend
					mixpanel.people.set_once(prop, to, callback)
				else
					if !userId
						throw new Error('(Resin Mixpanel Client) Please login() before using setUserOnce()')
					mixpanel.people.set_once(userId, prop, to, callback)

			track: (event, properties, callback) ->
				if !@isFrontend
					properties.distinct_id = userId
				mixpanel.track.call(mixpanel, event, properties, callback)
		}