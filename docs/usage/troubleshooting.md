---
sort: 7
---

# Troubleshooting
There are several ways of troubleshooting issues with diagram maker.

## Redux Devtools Extension
Redux DevTools are the easiest and most effective way to troubleshoot issues with diagram maker. This extension allows you to inspect the state of the redux store, the action objects with timestamps, and how the state changes over time. It lets you modify the state and see the page content change with state, and supports a time traveling debugger. To use this:
* Follow installation steps for your browser of choice here: http://extension.remotedev.io/
* In your diagram maker instantiation, pass this in place of consumerEnhancer:

```javascript
function addDevTools() {
  if (process.env.NODE_ENV === 'development') {
    return window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__();
  }
}

const diagramMaker = new DiagramMaker(
  container,
  {
    // config
    ...
  },
  {
    consumerEnhancer: addDevTools()
  }
)
```

## Browser Devtools
You can use the browser dev tools to put breakpoints, inspect values, etc using the browser dev tools you might be already familiar with. You should be able to do this already, but the dev tools would show the entire diagram maker code under a single file: `diagramMaker.js` which even though is not minified, but is transpiled from typescript to javascript and concatenated into a single file. One way to make this better is by using `source-map-loader` if you are using webpack to bundle your assets.

```javascript
//Webpack Dev config
module.exports = {
  module: {
    rules: {
      {
        test: /\.js$/,
        loader: 'source-map-loader',
        enforce: 'pre'
      },
      ...
    }
  }
  ...
};
```

## Typedoc generated documentation
You can use the [typedoc](http://typedoc.org/) generated documentation [here]({{ '/typedoc/globals.html' | relative_url }}) to find out more information about any of our exported symbols.
