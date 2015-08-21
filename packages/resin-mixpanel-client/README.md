# Resin Mixpanel Client

Resin Mixpanel Client facility.

## Installing

```sh
$ npm install resin-mixpanel-client
```

```sh
$ bower install resin-mixpanel-client
```

## Development mode

The following command will watch for any changes you make:

```sh
$ gulp watch
```

## Using

```coffeescript
MixpanelClient = require('resin-mixpanel-client')

...
if eventType is 'signup'
    MixpanelClient.signup userId, -> # optional callback

if (eventType is 'login')
    MixpanelClient.login userId, -> #

MixpanelClient.set props, -> #
MixpanelClient.setOnce props, -> #

MixpanelClient.setUser props, to, -> #
MixpanelClient.setUserOnce props, to, -> #

MixpanelClient.track eventName, properties, -> #

if (eventType is 'logout')
    MixpanelClient.logout -> #

```