# Resin Mixpanel Client

Resin Mixpanel Client facility.

## Installing

```sh
$ npm install resin-mixpanel-client
```

## Using

```javascript
var MixpanelClient = require('resin-mixpanel-client')

if (eventType === 'signup') {
	MixpanelClient.signup(userId)
}

if (eventType === 'login') {
	MixpanelClient.login(userId)
}

MixpanelClient.set(props)
MixpanelClient.setOnce(props)

MixpanelClient.setUser(props)
MixpanelClient.setUserOnce(props)

MixpanelClient.track(eventName, props)

if (eventType is 'logout') {
	MixpanelClient.logout()
}
```

ALl methods return Promises.
