# 2.2.1

* Update resin-universal-mixpanel dependency

# 2.2.0

* Allow anon login and event tracking

# 2.1.0

* Accept a mixpanel options object

# 2.0.0

* Mixpanel users will be created if they do not exist on `login`/`signup` in Node (this previously only happened in the browser).
* Mixpanel is now bundled, and loaded synchronously, so should never fail to load.
* **Breaking!** `set` and `setOnce` have now been removed.

# 1.0.0

* ** Breaking!** `setUser` and `setUserOnce` now only accept a single props object
* ** Breaking!** Switch to promises
* Convert to JS

