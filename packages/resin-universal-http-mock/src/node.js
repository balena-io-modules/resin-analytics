var _ = require('lodash')
var nock = require('nock')

module.exports = {
	init: function () {

	},
	teardown: function () {

	},
	reset: function () {

	},
	create: function (options) {
		options = _.defaults(options, { method: 'get' })

		var result = nock(options.host)

		var method = options.method.toLowerCase()
		if (method === 'get') {
			result = result.get(options.endpoint)
		} else {
			result = result[method](options.endpoint, options.filterBody)
		}

		if (options.filterQuery) {
			result = result.query(options.filterQuery)
		}

		return result.reply(options.statusCode || 200, options.response || '')
	}
}
