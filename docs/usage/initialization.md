---
sort: 2
---

# Initialization

```javascript

import DiagramMaker from 'diagram-maker';

const diagramMaker = new DiagramMaker(
  container,
  config,
  optionalParams // { initialData, eventListener, consumerRootReducer, consumerEnhancer }
);
```

The parameters required for the constructing an instance of Diagram Maker are as follows. The type definitions can be found [here](/typedoc/classes/diagrammaker.html#constructor).
* **Container**: Used to determine the DOM node where diagram maker should render. Could either be the DOM node itself or be the ID of the DOM node. If using the string ID, please ensure that the DOM node should be present in the page DOM at the time of initialization. Similarly, if using DOM node object, please ensure the object is part of the DOM at time of initialization.
* **Configuration**: Described in the [Configuration](/usage/configuration.html) section.
* **Optional Parameters** is an object that could contain params listed below:
  * **Initial Data**: This is an object describing the state that should be rendered when diagram maker initializes. Therefore, this must adhere to the object structure of the diagram maker state mentioned in the upcoming sections.
  * **Consumer Root Reducer**: This is a [redux](https://redux.js.org/) style [reducer](https://redux.js.org/basics/reducers) that will get the current state & action and it could return new state based on these two params. This must adhere to the same rules as a redux reducer, namely shallow immutability. Also, note that current state is already modified in case the action was initiated by diagram maker itself. In case, it was a custom action fired using the API, this is the original state instead of the modified state.
  * **Consumer Enhancer**: This is a [redux](https://redux.js.org/) style [enhancer](https://redux.js.org/advanced/middleware) that is applied to our underlying store. This is useful for enabling debugging tools like Redux dev tools extension, or used by plugins. In most cases, there should be no need for a consumer to write an enhancer by hand.
  * **Event Listener**: This is a listener that is invoked on all events flowing through the UI events stream. This is useful when you want to use the library's inbuilt UI events module to detect, normalize and fire UI events for DOM that was not rendered by diagram maker. This can be used to listen to events and then dispatch actions on the store. Useful for plugins.

## Importing Styles

All the above steps help you integrate Diagram Maker into your application, but it doesnt render properly without the styles. For importing the styles add this to your application's entry point.

```javascript
import 'diagram-maker/dist/diagramMaker.css';
```
