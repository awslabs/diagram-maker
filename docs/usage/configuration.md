---
sort: 3
---

# Configuration

## Terminology
* **Node**: A graph is a structure containing a set of objects in which some pairs of the objects are in some sense "related". ([Source](https://en.wikipedia.org/wiki/Graph_(discrete_mathematics))). The objects between which relations exist are referred to as nodes or vertices.
* **Edge**: An edge a joining connection between two nodes. It is represented as a line connecting the 2 nodes. It may or may not have a direction. Diagram Maker state structure always requires edges to have a source & a destination, but for undirected graphs we can assign source & destination arbitrary from the 2 nodes being connected.
* **Connectors**: The part of the node where the line representing the edge comes in contact with the node. This may or may not be rendered by Diagram maker. In some configurations, there are 2 types of connectors, input & output. The input connector is where edges terminate i.e. its destination. The output connector is where edges originate i.e. its source. For undirected graphs, the consumer might choose to designate the the same element within the node or even the entire node as an input as well as output connector. To provide all 3 interactions, node dragging, dropping incoming edges and dragging new edges, we recommend using circular nodes with the whole node as output connector and a smaller inner circle as input connector that can be used for node dragging as well. Check out our example for circular nodes [here]({{ '/examples/BoundaryCircular.html' | relative_url }}).
* **Potential Node**: When a new node is being dragged onto the workspace, the node doesnt exist until its dropped onto the workspace. However, the user might interact and drag it around before dropping it onto the workspace. This is referred to as a potential node.
* **Potential Edge**: When a new edge is being dragged, the edge doesnt exist until its dropped onto an input connector. However, the user might interact and drag it around before dropping it onto the input connector. This is referred to as a potential edge.
* **Node Type**: Nodes can optionally contain types. These serve 2 purposes. One, they can be used to model different types of node that will be rendered differently. For example, you could have types like "Terminal", "Process" and "Decision" nodes in a [flowchart](https://en.wikipedia.org/wiki/Flowchart). Secondly, you can override the configurations at a node type level for size, shape and connector related configurations.
* **Canvas**/**Workspace**: Canvas or workspace refers to the rectangular area where the nodes & edges are laid out. This area might frequently stretch outside the visible area of the container or the screen and can be panned or zoomed.
* **Editor**: The visble area of diagram maker that contains the visible portion of the workspace along with several elements that our outside the workspace like panels, conext menu and selection marquee.
* **Panel**: Panels are UI components that contain additional tools or functionality to manipulate or work with the canvas. Examples of panels include Library (a collection of nodes that can be dragged onto the canvas), Tools (a collection of tools to modify or manipulate the workspace), History (a panel to show the last few actions performed on the workspace), Minimap (a panel to show a small map of the entire canvas when the canvas gets too big and harder to naviagte), etc.
* **Context Menu**: Context menus are UI components which provide contextual information for other UI elements, such as; nodes, edges, panels or workspace are right clicked. These menus can be populated with arbitrary content.
* **Mode**: The diagram maker editor can be in 1 of 3 modes:
  * **Drag**: Drag mode allow, dragging on the workspace pans the workspace.
  * **Select**: In this mode, dragging on the workspace draws a selection marquee to select multiple nodes and edges.
  * **Read Only**: In this mode, nodes and edges cannot be added or removed. The workspace can only be panned or zoomed.
* **Selection Marquee**: This is a rectangule drawn to select multiple nodes within its bounds and edges for which both nodes are within bounds.

## Configuration Object
```typescript
export interface DiagramMakerConfig<NodeType, EdgeType> {
  /**
   * Optional configuration for diagram maker
   */
  options?: {
    /**
     * Connector placement. Determines how the edges are rendered.
     * Also renders default connectors for some placement types.
     * Defaults to CENTERED placement.
     */
    connectorPlacement?: ConnectorPlacementType;
    /**
     * Show an arrowhead at the destination end of the edge.
     * Defaults to false.
     */
    showArrowhead?: boolean;
  };
  /**
   * Render Callbacks for rendering nodes, potential nodes, edges, panels,
   * context menus, etc.
   */
  renderCallbacks: RenderCallbacks<NodeType, EdgeType>;
  /**
   * Action interceptor. Before any action is dispatched to the store,
   * you may intercept and modify it or cancel it entirely.
   * Please keep in mind that in case you implement an interceptor,
   * you're responsible for dispatching the action.
   *
   * @example <caption>Logging an action</caption>
   * const log = (action, dispatch, getState) => {
   *   console.log(action);
   *   dispatch(action);
   * };
   */
  actionInterceptor?: ActionInterceptor<NodeType, EdgeType>;
  /**
   * Node Type Configuration. Optional.
   * Useful for specifying overrides for connector placement or visible connectors.
   * Also, useful for providing for size for potential nodes being dragged using the same type.
   * Is required when using boundary connector placement to provide shapes for different
   * node types.
   */
  nodeTypeConfig?: {
    [typeId: string]: DiagramMakerNodeTypeConfiguration;
  };
}
```

## Connector Placement
Diagram maker determines the start & end points for the edges using this configuration. It also helps in specifying whether diagram maker will render default connectors & where.
* **Centered** - Edges start at the geometrical center of the bounding box for the node. Diagram Maker doesn't render connectors.
* **Left Right** - Edges start at vertical center of the right edge & end at the vertical center of the left edge of the bounding box for the node. Diagram Maker renders connectors.
* **Top Bottom** - Edges start at horizontal center of the bottom edge & end at the horizontal center of the top edge of the bounding box for the node. Diagram Maker renders connectors.
* **Boundary** - Edges start at the boundary of the node. This means that the edge seems like going toward the geometrical center of the node, but gets cut at the boundary. This is true for both start & end of the edge. Useful in conjunction with show arrowhead. Requires the shape to be provided for the node. Diagram Maker doesn't render connectors.

## Show Arrowhead
Diagram maker renders arrowheads at the end of an edge.

## Render Callbacks
Callbacks to render different parts of the diagram maker UI:

* **Node**: Renders the body of a node given the entire state object of the node.
* **Edge**: Renders a badge to be displayed at the geometrical center of the edge given the entire state object of the edge.
* **Panel**: Renders panel content to be displayed within a panel container rendered by diagram maker, given the entire state object of the panel.
* **Potential Node**: Renders the potential node given the entire state object of the potential node.
* **Context Menu**: Renders a context menu at the cursor position, given the id of the target (only in case of nodes, edges & panels, but not in case of the workspace).
* **Destroy**: This is a special callback used to cleanup event handlers if any were attached manually or using a rendering framework on the diagram maker container before it gets cleaned up. This is important because not doing proper cleanup of event listeners could lead to a memory leak and slow your web application down and could even cause the browser to crash. This is because the DOM node & event listeners each have a reference to each other and when the DOM node gets removed from the DOM tree, it still cannot be garbage collected due to this cyclic reference.

**Example: Vanilla JS**
```javascript
{
  // Example Render Callback that displays the id within the node
  node: (node, container) => {
    const newDiv = document.createElement('div');
    const newContent = document.createTextNode(node.id);
    newDiv.appendChild(newContent);
    newDiv.classList.add('example-node');
    if (node.diagramMakerData.selected) {
      newDiv.classList.add('selected');
    }
    container.innerHTML = '';
    container.appendChild(newDiv);
    container.addEventListener('click', myAwesomeEventListener);
  },
  // Example destroy callback that removes the event listener
  destroy: (container) => {
    container.removeEventListener('click', myAwesomeEventListener);
  }
  ...
}
```

**Example: Vanilla TS**
```typescript
{
  // Example Render Callback that displays the id within the node
  node: (node: DiagramMakerNode<{}>, container: HTMLElement) => {
    const newDiv = document.createElement('div');
    const newContent = document.createTextNode(node.id);
    newDiv.appendChild(newContent);
    newDiv.classList.add('example-node');
    if (node.diagramMakerData.selected) {
      newDiv.classList.add('selected');
    }
    container.innerHTML = '';
    container.appendChild(newDiv);
    container.addEventListener('click', myAwesomeEventListener);
  },
  // Example destroy callback that removes the event listener
  destroy: (container: HTMLElement) => {
    container.removeEventListener('click', myAwesomeEventListener);
  }
  ...
}
```

**Example: React**
```typescript
{
  // Example Render Callback that displays the id within the node
  node: (node: DiagramMakerNode<{}>, container: HTMLElement) => {
    ReactDOM.render(
      <Node
        id={node.id}
        selected={node.diagramMakerData.selected}
      />,
      container
    );
  },
  // Example destroy callback that removes the event listener
  destroy: (container: HTMLElement) => {
    ReactDOM.unmountComponentAtNode(container)
  }
  ...
}
```

**Example: Preact**
```typescript
{
  // Example Render Callback that displays the id within the node
  node: (node: DiagramMakerNode<{}>, container: HTMLElement, consumerContainer: Element) => {
    return Preact.render(
      <Node
        id={node.id}
        selected={node.diagramMakerData.selected}
      />,
      container,
      consumerContainer
    );
  },
  // Example destroy callback that removes the event listener
  destroy: (container: HTMLElement, consumerContainer: Element) => {
    Preact.render(null, container, consumerContainer);
  }
  ...
}s
```

## Action Interceptor
This is a hook provided to the consumers that provides control over the behavior of diagram maker. This allows you to intercept any action before it is dispatched to the store and then modify it or cancel it entirely. Please keep in mind that in case you implement an interceptor, you're responsible for dispatching the action.

**Example: Logging an action**
```javascript
const log = (action, dispatch, getState) => {
  console.log(action);
  dispatch(action);
};
```

**Example: Cancelling an action**
```javascript
const cancel = (action, dispatch, getState) => {
  // You can cancel an action by simply not calling dispatch(action)
  return;
};
```

**Example: Modifying an action**
```javascript
const modify = (action, dispatch, getState) => {
  const newAction = {
    ...action,
    type: 'ANOTHER_TYPE'
  };
  dispatch(newAction);
};
```

**Example: Firing additional actions**
```javascript
const multipleActions = (action, dispatch, getState) => {
  dispatch({
    type: 'ANOTHER_ACTION'
  });
  dispatch({
    type: 'YET_ANOTHER_ACTION'
  });
  dispatch(action);
};
```

**Example: Firing actions asynchronously**
```javascript
const asyncActions = (action, dispatch, getState) => {
  setTimeout(
    () => {
      dispatch({
        type: 'AN_ASYNC_ACTION'
      });
    },
    1000);
  dispatch(action);
};
```

## Node Type Configuration
There are several configurations within diagram maker that maybe different from node to node. In most use cases, nodes have an associated type and there could be several nodes that share a single type and hence share some of these configurations that may be different from other node types. This configuration can be used to configure such overrides. The properties supported within the node type configuration are:
* **Size** - This can be used to provide size for potential nodes that will have a given type. This is currently a required attribute. Using this can help you keep the DOM clean and there will be no need to provide the size using our declarative DOM API for it.
* **Connector Placement Override** - This can be used to provide a connector placement override for some given node types. For example, the global connector placement configuration could be set to LeftRight, but you could choose to set it to Centered or TopBottom for a certain type of nodes. This is optional.
* **Visible Connector Types** - This can be used to override diagram maker's behavior to render default connectors for LeftRight & TopBottom connector placements. For example, you might configure start nodes to only display output connector & the end node to only display the input connector. This is optional.
* **Shape** - This is used to configure the shape for this type of nodes. This is only useful when using the Boundary connector placement for edge calculations.
