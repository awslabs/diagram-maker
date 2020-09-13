---
sort: 1
---

# Architecture

Before jumping to the section containing instructions, lets just quickly take a look at the high level architecture. This will help us in understanding where different parts of the public API fit in and how they work. You may choose to skip this section if you want to jump right into the instructions on how to integrate Diagram Maker into your application.

![Architecture](/assets/Architecture.png)

These are the major components within Diagram Maker:

* **Observer**: This a small event stream utility class created within Diagram Maker. This acts a pub-sub layer where events can be published & subscribed to. Within Diagram maker, we use it to publish & subcribe to important UI events on elements with data attributes that Diagram Maker is listening on. This might include DOM elements rendered by Diagram Maker as well as the host application.
* **UI Events Module**: This is the module that has event handlers for the DOM events that Diagram maker is listening to. This then normalizes the event and adds some context to the event like positions and pushes it onto the event stream i.e. observer.
* **State**: Diagram maker manages the state of the canvas as well as editor elements like panels, etc. For managing this state, we use [Redux](https://redux.js.org/) underneath. This represents a redux store that is initialized and managed within Diagram Maker.
* **Action Creators**: These are a set of utility functions that create [redux style actions](https://redux.js.org/basics/actions) to be dispatched onto the redux store containging the Diagram Maker state.
* **Action Dispatchers**: This is the module that subscribes to the event stream containing the UI events. Based on the element and its data attributes where the UI event was triggered, this module with the help of action creators, dispatches actions onto the redux store containing our state.
* **Reducers**: This is a set of functions that are passed into the redux store to describe how state is modified in response to actions. Read more about reducers [here](https://redux.js.org/basics/reducers).
* **Components**: This is a set of components that are rendered to display the editor UI. We use [Preact](https://preactjs.com/) underneath to render our components. Some of these components might use the consumer's provided methods to render nodes, panels, etc.
* **API Module**: This is a module that provides an API to our consumers for functionality that is most commonly associated with visual editors such as zoom controls, undo-redo, focus controls, modes, etc.

These are the components that are supplied by the host application:
* **Components**: For using this library, the only piece of code the library expects the consumers to provide is the code to render the various sections within the UI. This is because we provide full customizability to the look & feel of the rendered editor. We achieve this by requiring the consumers to handle the rendering of nodes, panels, etc which frequently change based on use case.
* **Reducers (Optional)**: This is an optional hook to control the behavior of this library. The library comes with reducers to handle several actons that the library uses internally to provide interactivity features. However, consumers can override this behavior by supplying their own reducers which can react to Diagram Maker's internal actions as well as to their own actions.
* **Action Interceptor (Optional)**: This is another optional hook to the control the behavior of this library. Whenever, Diagram Maker dispatches an action to the store, it first calls the action interceptor configured by the consumer. At this point, the consumers have an option to cancel, modify or trigger any additional actions synchronously or asynchronously.
* **Interaction Handlers (Optional)**: When consumers want to use the inbuilt functionality that is provided via the API module to provide an IDE like experience, they might render panels based on their use case with these tools. In such a case, they would bind event handlers to these buttons within their panel that will then call Diagram Maker's underlying API module to implement the tool's functionality.
