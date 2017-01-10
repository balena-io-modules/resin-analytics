# Resin Event Log

Resin event logging facility.

## Installing

```sh
$ npm install resin-event-log
```

## Using

```javascript
var EventLog = require('resin-event-log')

var eventLogger = EventLog(MIXPANEL_TOKEN, 'Subsystem - UI, CLI, etc.', {
	// Hooks:
	beforeCreate: function (type, jsonData, applicationId, deviceId, callback) {
		this.start('User ID', callback)
	}
	afterCreate: function (type, jsonData, applicationId, deviceId) {
		if (type === 'User Logout') {
			this.end()
		}
	}
})

// Example logged event:
eventLoger.user.login(
	{ json: 'data' }, // Or null
	'Application ID', // Optional
	'Device ID' // Optional
)

// Example logged event without params:
eventLoger.user.login()
```

## Available hooks:

```javascript
beforeCreate = function (type, jsonData, applicationId, deviceId, callback) { return callback() } 
afterCreate = function (type, jsonData, applicationId, deviceId) {} 
```
