# 1.4.0

* Accept a new `mixpanelHost` option to override the mixpanel API domain

# 1.3.0

* Mixpanel users will be created if they do not exist on `login`/`signup` in Node (this previously only happened in the browser).
* Mixpanel is now bundled, and loaded synchronously, so should never fail to load.

## 1.2.0

* Return rejected promises from the GA methods instead of throwing (prevents unhandled errors in the downstream code)

## 1.1.1

* Make GA more resilient to incorrect usage and tracking problems

## 1.1.0

* Now running $set (instead of $set_once) for the user props we'd like to keep up to date

## 1.0.0

* **Breaking!** `mixpanelToken` is not mandatory anymore. If not provided events are not reported to Mixpanel (a warning is printed in `debug` mode).
* Added `debug` option
* **Breaking!** Now all the options are combined into a single object, `subsystem` param is now known as `prefix`, see README
* **Breaking!** The `afterCreate` hook now receives `error` as the first argument
* Convert to JS

## 0.1.1

* Fix bower version

## 0.1.0

* Updated lodash to ^4.0.0
