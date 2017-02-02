var _ = require('lodash')
var expect = require('chai').expect
var base64Decode = require('base-64').decode
var querystring = require('querystring')

var mock = require('resin-universal-http-mock')
mock.init()

if (typeof window !== 'undefined') {
	window.MIXPANEL_CUSTOM_LIB_URL = 'http://cdn.mxpnl.com/libs/mixpanel-2-latest.js'
}

var ResinEventLog = require('..')

var MIXPANEL_TOKEN = 'MIXPANEL_TOKEN'
var SYSTEM = 'TEST'
var MIXPANEL_HOST = 'http://api.mixpanel.com'
var GA_ID = 'GOOGLE_ID'
var GA_SITE = 'resintest.io'
var GA_HOST = 'http://www.google-analytics.com'

function validateMixpanelQuery(queryObject) {
	var data = queryObject.data
	if (!data) return false

	try {
		data = JSON.parse(base64Decode(data))
		return (
			data && data.properties &&
			data.properties.token === MIXPANEL_TOKEN
		)
	} catch (e) {
		return false
	}
}

function createMixpanelNock(options) {
	_.defaults(options, {
		host: MIXPANEL_HOST,
		method: 'GET',
		filterQuery: validateMixpanelQuery,
		response: '1'
	})
	return mock.create(options)
}

function validateGaBody(bodyString) {
	var data = bodyString.split('\n')[0]
	if (!data) return false

	try {
		data = querystring.parse(data)

		return (
			data &&
			data.t === 'event' &&
			data.tid === GA_ID &&
			data.ec === GA_SITE &&
			data.el === SYSTEM
		)
	} catch (e) {
		return false
	}
}

function createGaNock(endpoint) {
	return mock.create({
		host: GA_HOST,
		endpoint: endpoint,
		method: 'POST',
		filterBody: validateGaBody
	})
}

describe('ResinEventLog', function () {
	after(function() {
		mock.teardown()
	})

	describe('Mixpanel track', function () {
		before(function() {
			createMixpanelNock({
				endpoint: '/decide',
				filterQuery: null,
				response: JSON.stringify({"notifications":[],"config":{"enable_collect_everything":false}})
			})
		})

		it('should make request to Mixpanel and pass the token', function (done) {
			var nockRequest = createMixpanelNock({ endpoint: '/track' })

			var eventLog = ResinEventLog({
				mixpanelToken: MIXPANEL_TOKEN,
				prefix: SYSTEM,
				afterCreate: function(err, type, jsonData, applicationId, deviceId) {
					if (err) {
						console.error('Mixpanel error:', err)
					}
					expect(!err).to.be.ok
					expect(nockRequest.isDone()).to.be.ok
					expect(type).to.be.equal('x')
					done()
				}
			})

			eventLog.create('x')
		})

		it('should have semantic methods like device.rename that send requests to mixpanel', function (done) {
			var nockRequest = createMixpanelNock({ endpoint: '/track' })

			var eventLog = ResinEventLog({
				mixpanelToken: MIXPANEL_TOKEN,
				prefix: SYSTEM,
				afterCreate: function(err, type, jsonData, applicationId, deviceId) {
					if (err) {
						console.error('Mixpanel error:', err)
					}
					expect(!err).to.be.ok
					expect(nockRequest.isDone()).to.be.ok
					expect(type).to.be.equal('Device Rename')
					done()
				}
			})

			eventLog.device.rename()
		})
	})

	describe.skip('GA track', function () {
		it('should make request to GA', function (done) {
			var nockRequest = createGaNock('/collect')

			var eventLog = ResinEventLog({
				debug: true,
				gaId: GA_ID,
				gaSite: GA_SITE,
				prefix: SYSTEM,
				afterCreate: function(err, type, jsonData, applicationId, deviceId) {
					if (err) {
						console.error('GA error:', err)
					}
					expect(!err).to.be.ok
					expect(nockRequest.isDone()).to.be.ok
					expect(type).to.be.equal('x')
					done()
				}
			})

			eventLog.create('x')
		})

		it('should have semantic methods like device.rename that send requests to mixpanel', function (done) {
			var nockRequest = createGaNock('/collect')

			var eventLog = ResinEventLog({
				gaId: GA_ID,
				gaSite: GA_SITE,
				prefix: SYSTEM,
				afterCreate: function(err, type, jsonData, applicationId, deviceId) {
					if (err) {
						console.error('GA error:', err)
					}
					expect(!err).to.be.ok
					expect(nockRequest.isDone()).to.be.ok
					expect(type).to.be.equal('Device Rename')
					done()
				}
			})

			eventLog.device.rename()
		})
	})
})
