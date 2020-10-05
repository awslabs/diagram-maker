---
sort: 1
---

# Architecture

Before jumping to the section containing instructions, lets just quickly take a look at the high level architecture. This will help us in understanding where different parts of the public API fit in and how they work. You may choose to skip this section if you want to jump right into the instructions on how to integrate Diagram Maker into your application.

![Architecture]({{ '/assets/Architecture.png' | relative_url }})

These are the major components within Diagram Maker:

* **Observer**: An Observer is a small event stream utility class created within Diagram Maker. This acts a pub-sub layer where UI events can be published & subscribed to. Within Diagram maker, Observers are used to publish & subcribe to UI events on elements with data attributes that Diagram Maker is listening to. This might include DOM elements rendered by Diagram Maker as well as the host application.
* **UI Events Module**: The Events module has event handlers for DOM events that Diagram maker is listening to. This normalizes and adds context to the event, like positions, and pushes it onto the event stream (i.e. observer.)
* **State**: Diagram maker manages the state of the canvas as well as editor elements like panels, etc. For managing this state, we use [Redux](https://redux.js.org/) underneath. This represents a redux store that is initialized and managed within Diagram Maker.
* **Action Creators**: These are a set of utility functions that create [redux style actions](https://redux.js.org/basics/actions) to be dispatched onto the redux store containing the Diagram Maker state.
* **Action Dispatchers**: Action Dispacters subscribe to the event stream containing the UI events. This module dispatches actions onto the redux stage store by utilizing Action Creators.
* **Reducers**: Reducers are a set of functions which describe how the redux state is modified in response to actions. Read more about reducers [here](https://redux.js.org/basics/reducers).
* **Components**: Components are the UI modules which are rendered to display the editor. We use [Preact](https://preactjs.com/) underneath to render our components. Some of these components might use the consumer's provided methods to render nodes, panels, etc.
* **API Module**: This module provides an API to consumers for functionality that is most commonly associated with visual editors. Such as; zoom controls, undo-redo, focus controls, modes, etc.

These are the components that are supplied by the host application:
* **Components**: The only piece of code the library expects consumers to provide, is code to render the various sections within the UI. The library is fully customizable to the look & feel of the rendered editor. This is achieved by requiring consumers to handle the rendering of nodes and panels, which frequently change based on use case.
* **Reducers (Optional)**: Reducers are an optional hook to control the behavior of this library. The library comes with reducers to handle several actions that the library uses internally to provide interactivity features. Consumers can override this behavior by supplying their own reducers which can react to Diagram Maker's internal actions, as well as to their own custom actions.
* **Action Interceptor (Optional)**: This is an optional hook to apply additional dispatched event behavior. Whenever, Diagram Maker dispatches an action to the store, it first calls the action interceptor configured by the consumer. At this point, the consumers have an option to cancel, modify or trigger any additional actions synchronously or asynchronously.
* **Interaction Handlers (Optional)**: When consumers want to use the inbuilt functionality that is provided via the API module to provide an IDE like experience, they might render panels based on their use case with these tools. In such a case, they would bind event handlers to these buttons within their panel that will then call Diagram Maker's underlying API module to implement the tool's functionality.
