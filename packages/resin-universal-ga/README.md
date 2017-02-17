# Resin Universal GA Wrapper

Loads the `universal-analytics` module in Node.js and (asynchronously) the library from the CDN in the browser.

Browser usage needs Webpack, Browserify or other bundler that tolerates the `browser` field in `package.json`.

## Installing

```sh
$ npm install resin-universal-ga
```

## Debugging in the browser

In the browser the global `GA_CUSTOM_LIB_URL` variable can be set
to make GA loader load a different GA implementation
(for example, mocked or with extra debug info).

The official debug version from Google is
`https://www.google-analytics.com/analytics_debug.js`.
