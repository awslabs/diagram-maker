---
sort: 1
---

# Features

### Framework agnostic
Diagram Maker can be used within any rendering framework like React, Vue, etc.
It can be used even with vanilla Javascript or Typescript.

### Data format agnostic
Diagram Maker stores its data in a generic data structure which holds a map of nodes against a unique ID
and edges in another map describing the source & destination node IDs. This allows for any graph-like data
to be converted into our expected data format and vice versa. We also provide a consumerData section
within that data structure so that consumers of this library can store arbitrary, use case specific metadata
against the nodes and edges directly within Diagram Maker instead of keeping a separate store for this data
and having to merge diagram maker managed data and consumer managed data.

### Fully Customizable
Diagram Maker lets the consumers retain control over the look & feel of the nodes that are rendered within the editor.
This allows consumers to adapt the library to a variety of use cases. On top of it, most of the styling can also be overridden
using standard CSS applied to Diagram Maker classes added to various elements of the editor. Not only is the look & feel customizable,
but so is the behavior. Diagram Maker lets consumers hook into the events passing through diagram maker both triggered by user interaction
or triggered by the host application via APIs. This allows consumers to change or suppress diagram maker's behavior for its own events or extend it
with new events.

### Declarative Interface
Diagram Maker exposes a [declarative](https://en.wikipedia.org/wiki/Declarative_programming) interface where
the consumers only need to supply a serialized data structure that our library expects. The library takes care
of rendering the graph without the consumers having to make several different function calls. For rendering the
nodes, the library allows the consumers to retain full control of the HTML rendered for every node. For interactive
features that require parts of the node to be treated as draggable or drop zones, we again use a declarative interface
requiring consumers to put data attributes to instruct Diagram Maker to treat these parts of the node as elements to be used
for interactivity.

### Bundled Types
Diagram Maker comes with bundled types which means if you are using Typescript, you can catch certain classes of errors with type checking
and prevent those errors from ever reaching your production web application. The types also help the development workflow by
providing the consumers with IDE hints when working with Diagram Maker APIs.

### Interactive features
Diagram Maker offers several interactive features bundled within the library that developers dont need to reimplement. These include:
* In-built Node dragging
* Drag to create edges
* Canvas panning & zooming
* Panel dragging
* Context menus
* Keyboard shortcuts for selecting all, deleting
* Modes (dragging mode, selection mode for multi select, read only mode for restricting edits)
* API interface for
  * Undoing & redoing mutative actions
  * Fitting all the nodes inside the view
  * Focusing given or selected nodes
  * Layout

### Extensible
The options exposed to consumers for customization of the look & feel as well as behavior of Diagram maker can also be used by plugin
authors to extend the core capabilities of this library.
