var expect = require('chai').expect
var nock = require('nock')
var base64Decode = require('base-64').decode

var ResinEventLog = require('../packages/resin-event-log')

var MIXPANEL_TOKEN = 'MIXPANEL_TOKEN'
var SYSTEM = 'TEST'
var MIXPANEL_HOST = 'http://api.mixpanel.com'
var GA_ID = 'GOOGLE_ID'
var GA_SITE = 'resintest.io'
var GA_HOST = 'https://www.google-analytics.com'

function validateMixpanelQuery(queryObject) {
	var data = queryObject.data
	if (!data) return false

	try {
		data = JSON.parse(base64Decode(data))
		return (data && data.properties
			&& data.properties.token === MIXPANEL_TOKEN)
	} catch (e) {
		return false
	}
}

function createMixpanelNock(endpoint, responseCode) {
	return nock(MIXPANEL_HOST)
		.get(endpoint)
		.query(validateMixpanelQuery)
		.reply(responseCode || 200, '1')
}

function createGaNock(endpoint, responseCode) {
	return nock(GA_HOST)
		.get(endpoint)
		.query(validateMixpanelQuery)
		.reply(responseCode || 200, '1')
}

describe('ResinEventLog', function () {
	describe('mixpanel track', function () {
		it('should make request to mixpanel and pass the token', function (done) {
			var nockRequest = createMixpanelNock('/track', 201)

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
			var nockRequest = createMixpanelNock('/track', 201)

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

	describe('GA track', function () {
		it('should make request to GA', function (done) {
			var nockRequest = createMixpanelNock('/track', 201)

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
			var nockRequest = createMixpanelNock('/track', 201)

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
})
