var _ = require('lodash')
var xhrMock = require('xhr-mock')

module.exports = {
	init: function () {
		xhrMock.setup()
	},
	teardown: function () {
		xhrMock.teardown()
	},
	create: function (options) {
		options = _.defaults(options, { method: 'get' })

		var isDone = false
		var result = {
			isDone: function () {
				return isDone
			}
		}

		function reqMatches(req) {
			if (options.filterQuery) {
				if (!options.filterQuery(req.query())) {
					return false
				}
			}
			if (options.filterBody) {
				if (!options.filterBody(req.body())) {
					return false
				}
			}
			return true
		}

		function responder(req, res) {
			if (!reqMatches(req)) {
				return
			}
			isDone = true
			return res
				.status(options.statusCode || 200)
				.body(options.response || '')
		}

		var url = options.host + options.endpoint
		if (_.endsWith(url, '/')) {
			url = url.substring(0, url.length - 1)
		}
		var urlRe = new RegExp('^' + _.escapeRegExp(url) + '(\\/|\\?|$)')
		xhrMock.mock(options.method, urlRe, responder)

		return result
	}
}
