* Make GA more resilient to incorrect usage and tracking problems

## 1.1.0

* Now running $set (instead of $set_once) for the user props we'd like to keep up to date

## 1.0.0

* **Breaking!** `mixpanelToken` is not mandatory anymore. If not provided events
are not reported to Mixpanel (a warning is printed in `debug` mode).
* Added `debug` option
* **Breaking!** Now all the options are combined into a single object, `subsystem` param is now known as `prefix`, see README
* **Breaking!** The `afterCreate` hook now receives `error` as the first argument
* Convert to JS

## 0.1.1

* Fix bower version

## 0.1.0

* Updated lodash to ^4.0.0
