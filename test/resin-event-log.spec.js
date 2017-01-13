var expect = require('chai').expect
var nock = require('nock')
var base64Decode = require('base-64').decode

var ResinEventLog = require('../packages/resin-event-log')

var MIXPANEL_TOKEN = 'MIXPANEL_TOKEN'
var SYSTEM = 'TEST'
var MIXPANEL_HOST = 'http://api.mixpanel.com'

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

describe('ResinEventLog', function () {
	describe('track', function () {
		it('should make request to mixpanel and pass the token', function (done) {
			var nockRequest = createMixpanelNock('/track', 201)

			var eventLog = ResinEventLog(MIXPANEL_TOKEN, SYSTEM, {
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

		it('should have semantic methods like device.rename', function (done) {
			var nockRequest = createMixpanelNock('/track', 201)

			var eventLog = ResinEventLog(MIXPANEL_TOKEN, SYSTEM, {
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
