var _ = require('lodash')
var expect = require('chai').expect
var base64Decode = require('base-64').decode
var querystring = require('querystring')
var mock = require('resin-universal-http-mock')

var IS_BROWSER = typeof window !== 'undefined'

// NB: set to true to get some extra reporting
var EXTRA_DEBUG = false

if (IS_BROWSER) {
	window.MIXPANEL_CUSTOM_LIB_URL = 'http://cdn.mxpnl.com/libs/mixpanel-2-latest.js'
	if (EXTRA_DEBUG) {
		window.GA_CUSTOM_LIB_URL = 'https://www.google-analytics.com/analytics_debug.js'
	}
}

var ResinEventLog = require('..')

var MIXPANEL_TOKEN = 'MIXPANEL_TOKEN'
var SYSTEM = 'TEST'
var MIXPANEL_HOST = 'http://api.mixpanel.com'
var GA_ID = 'UA-123456-0'
var GA_SITE = 'resintest.io'
var GOSQUARED_ID = 'GSN-575655-Q'
var GOSQUARED_API_KEY = '12345'
var GOSQUARED_HOST = 'https://api.gosquared.com'
var GA_HOST = 'https://www.google-analytics.com'
var FAKE_USER = {
	username: 'fake',
	id: 123,
	email: 'fake@example.com',
	$created: new Date().toISOString()
}

function aggregateMock(mocks) {
	return {
		isDone: function() {
			return _.some(mocks, function(mock) {
				return mock.isDone()
			})
		}
	}
}

function validateMixpanelQuery(event) {
	return function(queryObject) {
		var data = queryObject.data
		if (!data) return false

		try {
			data = JSON.parse(base64Decode(data))
			return (
				data && data.properties &&
				data.properties.token === MIXPANEL_TOKEN &&
				(!event || event === data.event)
			)
		} catch (e) {
			return false
		}
	}
}

function createMixpanelMock(options, times) {
	times = times || 1

	_.defaults(options, {
		host: MIXPANEL_HOST,
		method: 'GET',
		filterQuery: validateMixpanelQuery(options.event),
		response: '1'
	})
	delete options.event

	var mocks = _.range(times).map(function () {
		return mock.create(options)
	})

	return aggregateMock(mocks)
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

function createOneGaMock(endpoint) {
	return mock.create({
		host: GA_HOST,
		endpoint: endpoint,
		method: 'POST',
		filterBody: validateGaBody
	})
}

function createGaMock(endpoint) {
	var mocks = [
		createOneGaMock(endpoint),
		createOneGaMock('/r' + endpoint)
	]
	return aggregateMock(mocks)
}

function validateGsQuery(queryString) {
	return (
		queryString.site_token === GOSQUARED_ID &&
		queryString.api_key === GOSQUARED_API_KEY
	)
}

function createGsMock(options, times) {
	times = times || 1

	_.defaults(options, {
		host: GOSQUARED_HOST,
		method: 'POST',
		filterQuery: validateGsQuery,
		filterBody: function() { return true },
		response: '1'
	})

	var mocks = _.range(times).map(function () {
		return mock.create(options)
	})

	return aggregateMock(mocks)
}

describe('ResinEventLog', function () {

	before(mock.init)
	afterEach(mock.reset)
	after(mock.teardown)

	describe('Mixpanel track', function () {
		var eventLog

		beforeEach(function() {
			// We send up to three /engage requests:
			// * on login: identify or $set_once with $distinct_id, to ensure the user exists
			// * after login: $set to set their email/name/etc
			// * after login: $set_once to set their created time, if they don't already have one.
			createMixpanelMock({
				endpoint: '/engage',
				filterQuery: function() { return true }
			}, 3)

			createMixpanelMock({
				endpoint: '/decide',
				filterQuery: function() { return true },
				response: JSON.stringify({"notifications":[],"config":{"enable_collect_everything":false}})
			})

			createMixpanelMock({
				endpoint: '/track',
				event: '$create_alias'
			})
		})

		afterEach(function() {
			return eventLog.end()
		})

		it('should make request to Mixpanel and pass the token', function (done) {
			var mockedRequest = createMixpanelMock({ endpoint: '/track' })

			eventLog = ResinEventLog({
				mixpanelToken: MIXPANEL_TOKEN,
				prefix: SYSTEM,
				debug: EXTRA_DEBUG,
				afterCreate: function(err, type, jsonData, applicationId, deviceId) {
					if (err) {
						console.error('Mixpanel error:', err)
					}
					expect(!err).to.be.ok
					expect(type).to.be.equal('x')
					expect(mockedRequest.isDone()).to.be.ok
					done()
				}
			})

			eventLog.start(FAKE_USER).then(function () {
				eventLog.create('x')
			})
		})

		it('should have semantic methods like device.rename that send requests to mixpanel', function (done) {
			var mockedRequest = createMixpanelMock({ endpoint: '/track' })

			eventLog = ResinEventLog({
				mixpanelToken: MIXPANEL_TOKEN,
				prefix: SYSTEM,
				debug: EXTRA_DEBUG,
				afterCreate: function(err, type, jsonData, applicationId, deviceId) {
					if (err) {
						console.error('Mixpanel error:', err)
					}
					expect(!err).to.be.ok
					expect(type).to.be.equal('Device Rename')
					expect(mockedRequest.isDone()).to.be.ok
					done()
				}
			})

			eventLog.start(FAKE_USER).then(function () {
				eventLog.device.rename()
			})
		})
	})

	describe('Mixpanel identity', function () {
		var eventLog

		beforeEach(function() {
			// We send up to three /engage requests:
			// * on login: identify or $set_once with $distinct_id, to ensure the user exists
			// * after login: $set to set their email/name/etc
			// * after login: $set_once to set their created time, if they don't already have one.
			createMixpanelMock({
				endpoint: '/engage',
				filterQuery: function() { return true }
			}, 3)

			createMixpanelMock({
				endpoint: '/decide',
				filterQuery: function() { return true },
				response: JSON.stringify({"notifications":[],"config":{"enable_collect_everything":false}})
			})
		})

		afterEach(function() {
			return eventLog.end()
		})

		it('should create alias when $created property is passed', function (done) {
			var aliasMock = createMixpanelMock({
				endpoint: '/track',
				event: '$create_alias'
			})
			var mockedRequest = createMixpanelMock({ endpoint: '/track' })

			eventLog = ResinEventLog({
				mixpanelToken: MIXPANEL_TOKEN,
				prefix: SYSTEM,
				debug: EXTRA_DEBUG,
				afterCreate: function(err, type, jsonData, applicationId, deviceId) {
					if (err) {
						console.error('Mixpanel error:', err)
					}
					expect(!err).to.be.ok
					expect(type).to.be.equal('x')
					expect(mockedRequest.isDone()).to.be.ok
					expect(aliasMock.isDone()).to.be.ok
					done()
				}
			})

			eventLog.start(FAKE_USER).then(function () {
				eventLog.create('x')
			})
		})

		it('should NOT create alias when $created property is not passed', function (done) {
			var aliasMock = createMixpanelMock({
				endpoint: '/track',
				event: '$create_alias'
			})
			var mockedRequest = createMixpanelMock({ endpoint: '/track' })

			eventLog = ResinEventLog({
				mixpanelToken: MIXPANEL_TOKEN,
				prefix: SYSTEM,
				debug: EXTRA_DEBUG,
				afterCreate: function(err, type, jsonData, applicationId, deviceId) {
					if (err) {
						console.error('Mixpanel error:', err)
					}
					expect(!err).to.be.ok
					expect(type).to.be.equal('x')
					expect(mockedRequest.isDone()).to.be.ok
					expect(!aliasMock.isDone()).to.be.ok
					done()
				}
			})

			eventLog.start({
				username: 'fake',
				id: 123,
				email: 'fake@example.com',
			}).then(function () {
				eventLog.create('x')
			})
		})
	})

	describe('GA track', function () {
		// NB: GA tests **must** be run with `debug: true`, it influences some the cookiDomain and transport params of GA tracking
		var eventLog

		afterEach(function() {
			return eventLog.end()
		})

		it('should make request to GA', function (done) {
			var mockedRequest = createGaMock('/collect')

			eventLog = ResinEventLog({
				gaId: GA_ID,
				gaSite: GA_SITE,
				prefix: SYSTEM,
				debug: true,
				afterCreate: function(err, type, jsonData, applicationId, deviceId) {
					if (err) {
						console.error('GA error:', err)
					}
					expect(!err).to.be.ok
					expect(type).to.be.equal('x')
					expect(mockedRequest.isDone()).to.be.ok
					done()
				}
			})

			eventLog.start(FAKE_USER).then(function () {
				eventLog.create('x')
			})
		})

		it('should have semantic methods like device.rename that send requests to GA', function (done) {
			var mockedRequest = createGaMock('/collect')

			eventLog = ResinEventLog({
				gaId: GA_ID,
				gaSite: GA_SITE,
				prefix: SYSTEM,
				debug: true,
				afterCreate: function(err, type, jsonData, applicationId, deviceId) {
					if (err) {
						console.error('GA error:', err)
					}
					expect(!err).to.be.ok
					expect(type).to.be.equal('Device Rename')
					expect(mockedRequest.isDone()).to.be.ok
					done()
				}
			})

			eventLog.start(FAKE_USER).then(function () {
				eventLog.device.rename()
			})
		})
	})

	describe('gosquared track', function () {
		this.timeout(15000)
		var endpoint = '/tracking/v1/event'
		var eventLog

		afterEach(function() {
			return eventLog.end()
		})

		it('should make request to gosquared', function (done) {
			var EXPECTED_EVENT = 'x'
			var mockedRequest = createGsMock({
				endpoint: endpoint,
				method: 'POST',
				filterBody: function (body, eventName) {
					return (body.event.name === '[' + SYSTEM + '] ' + EXPECTED_EVENT)
				}
			})
			eventLog = ResinEventLog({
				gosquaredId: GOSQUARED_ID,
				gosquaredApiKey: GOSQUARED_API_KEY,
				prefix: SYSTEM,
				debug: true,
				afterCreate: function(err, type, jsonData, applicationId, deviceId) {
					if (err) {
						console.error('gosquared error:', err)
					}
					expect(!err).to.be.ok
					expect(type).to.be.equal(EXPECTED_EVENT)

					if (!IS_BROWSER) {
						expect(mockedRequest.isDone()).to.be.ok
						done()
					} else {
						// TODO: mock browser tests.
						// see: https://github.com/resin-io-modules/resin-analytics/pull/14
						done()
					}
				}
			})

			eventLog.start(FAKE_USER).then(function () {
				eventLog.create(EXPECTED_EVENT)
			})
		})

		it('should have semantic methods like device.rename that send requests to gosquared', function (done) {
			var EXPECTED_EVENT = 'Device Rename'
			var mockedRequest = createGsMock({
				endpoint: endpoint,
				filterBody: function (body, eventName) {
					return (body.event.name === '[' + SYSTEM + '] ' + EXPECTED_EVENT)
				}
			})

			eventLog = ResinEventLog({
				gosquaredId: GOSQUARED_ID,
				gosquaredApiKey: GOSQUARED_API_KEY,
				prefix: SYSTEM,
				debug: true,
				afterCreate: function(err, type, jsonData, applicationId, deviceId) {
					if (err) {
						console.error('gosquared error:', err)
					}
					expect(!err).to.be.ok
					expect(type).to.be.equal(EXPECTED_EVENT)

					if (!IS_BROWSER) {
						expect(mockedRequest.isDone()).to.be.ok
						done()
					} else {
						// TODO: mock browser tests.
						// see: https://github.com/resin-io-modules/resin-analytics/pull/14
						done()
					}
				}
			})

			eventLog.start(FAKE_USER).then(function () {
				eventLog.device.rename()
			})
		})

		it('should attach person to event when user is given', function (done) {
			var EXPECTED_EVENT = 'y'
			var mockedRequest = createGsMock({
				endpoint: endpoint,
				filterBody: function (body, eventName) {
					return (
						body.event.name === '[' + SYSTEM + '] ' + EXPECTED_EVENT &&
						body.person_id == FAKE_USER.id
					)
				}
			})

			eventLog = ResinEventLog({
				gosquaredId: GOSQUARED_ID,
				gosquaredApiKey: GOSQUARED_API_KEY,
				prefix: SYSTEM,
				debug: true,
				afterCreate: function(err, type, jsonData, applicationId, deviceId) {
					if (err) {
						console.error('gosquared error:', err)
					}
					expect(!err).to.be.ok
					expect(type).to.be.equal(EXPECTED_EVENT)

					if (!IS_BROWSER) {
						expect(mockedRequest.isDone()).to.be.ok
						done()
					} else {
						// TODO: mock browser tests.
						// see: https://github.com/resin-io-modules/resin-analytics/pull/14
						done()
					}
				}
			})

			eventLog.start(FAKE_USER).then(function () {
				eventLog.create(EXPECTED_EVENT)
			})
		})
	})
})
