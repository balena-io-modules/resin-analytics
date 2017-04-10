# Resin Mixpanel Client

Resin Mixpanel Client facility.

## Installing

```sh
$ npm install resin-mixpanel-client
```

## Using

```javascript
var MixpanelClient = require('resin-mixpanel-client')

var client = MixpanelClient(token, options)

if (eventType === 'signup') {
	client.signup(userId)
}

if (eventType === 'login') {
	client.login(userId)
}

client.set(props)
client.setOnce(props)

client.setUser(props)
client.setUserOnce(props)

client.track(eventName, props)

if (eventType is 'logout') {
	client.logout()
}
```

ALl methods return Promises.
