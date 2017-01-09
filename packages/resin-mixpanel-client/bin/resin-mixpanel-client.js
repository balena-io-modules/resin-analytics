(function() {
  (function(root, factory) {
    if (typeof define === 'function' && define.amd) {
      return define([], function() {
        return factory(window.mixpanel);
      });
    } else if (typeof exports === 'object') {
      return module.exports = factory(require('mixpanel'));
    }
  })(this, function(mixpanelLib) {
    return function(token) {
      var mixpanel, userId;
      mixpanel = mixpanelLib.init(token);
      mixpanel.set_config({
        track_pageview: false
      });
      userId = null;
      return {
        isFrontend: typeof mixpanel.identify === 'function',
        signup: function(uid, callback) {
          if (this.isFrontend) {
            mixpanel.alias(uid, uid);
            return typeof callback === "function" ? callback() : void 0;
          } else {
            return mixpanel.alias(uid, uid, callback);
          }
        },
        login: function(uid, callback) {
          if (this.isFrontend) {
            mixpanel.identify(uid);
          }
          userId = uid;
          return typeof callback === "function" ? callback() : void 0;
        },
        logout: function(callback) {
          var ref;
          if (this.isFrontend) {
            if ((ref = mixpanel.cookie) != null) {
              ref.clear();
            }
          }
          userId = null;
          return typeof callback === "function" ? callback() : void 0;
        },
        set: function(props, callback) {
          if (!this.isFrontend) {
            return typeof callback === "function" ? callback() : void 0;
          }
          mixpanel.register(props);
          return typeof callback === "function" ? callback() : void 0;
        },
        setOnce: function(props, callback) {
          if (!this.isFrontend) {
            return typeof callback === "function" ? callback() : void 0;
          }
          mixpanel.register_once(props);
          return typeof callback === "function" ? callback() : void 0;
        },
        setUser: function(prop, to, callback) {
          if (this.isFrontend) {
            return mixpanel.people.set(prop, to, callback);
          } else {
            if (!userId) {
              throw new Error('(Resin Mixpanel Client) Please login() before using setUser()');
            }
            return mixpanel.people.set(userId, prop, to, callback);
          }
        },
        setUserOnce: function(prop, to, callback) {
          if (this.isFrontend) {
            return mixpanel.people.set_once(prop, to, callback);
          } else {
            if (!userId) {
              throw new Error('(Resin Mixpanel Client) Please login() before using setUserOnce()');
            }
            return mixpanel.people.set_once(userId, prop, to, callback);
          }
        },
        track: function(event, properties, callback) {
          if (!this.isFrontend) {
            properties.distinct_id = userId;
          }
          return mixpanel.track.call(mixpanel, event, properties, callback);
        }
      };
    };
  });

}).call(this);
