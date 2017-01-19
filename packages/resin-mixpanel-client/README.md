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
	MixpanelClient.signup(userId, function () { /* optional callback */ })
}

if (eventType === 'login') {
	MixpanelClient.login(userId, function () { })
}

MixpanelClient.set(props, function () { })
MixpanelClient.setOnce(props, function () { })

MixpanelClient.setUser(props, to, function () { })
MixpanelClient.setUserOnce(props, to, function () { })

MixpanelClient.track(eventName, properties, function () { })

if (eventType is 'logout') {
	MixpanelClient.logout(function () { })
}
```
