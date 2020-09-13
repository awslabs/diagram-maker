---
sort: 5
---

# API

## Diagram Maker Instance APIs
There are a few APIs that are accessed directly from the diagram maker object instance.

### Update Container
This API should be called by the consumer whenever there is a change to the size of the container that diagram maker is rendering in(Referred to by the first argument of diagram maker constructor). When diagram maker is rendered full screen, this should also be called when the window resizes.

**Example: Window Resize**
```javascript
window.addEventListener('resize', () => {
  diagramMaker.updateContainer();
});
```

### Destroy
This API should be called by the consumer when the container is about to be destroyed. This usually happens when the user navigates away from a page that uses diagram maker to a new page in the application.

**Example: React/Preact**
```javascript
public componentWillUnmount() {
  if (this.diagramMaker) {
    this.diagramMaker.destroy();
  }
}
```

Usually you will create a React/Preact Component wrapper that will instantiate Diagram Maker. When this component unmounts due to a route change or any other reason, it will destroy diagram maker before it unmounts.

### Store Object
The redux store can be accessed from the object instance. This is useful for accessing the state.

**Example: Fetching the current state**
```javascript
const diagramMaker = new DiagramMaker(container, config);
.
.
.
const currentState = diagramMaker.store.getState();
```

**Example: Listening to state updates**
```javascript
const diagramMaker = new DiagramMaker(container, config);
diagramMaker.store.subscribe(() => diagramMaker.store.getState()
```

## Diagram Maker API Object

Most functionality is exposed using the API object accessed on the diagram maker instance's ```api``` key. This object contains APIs that facilitate the manipulation of the diagram maker state such that you dont need to fire actions to achieve the same effect.

### Layout
The layout API will auto arrange the nodes based on the configuration passed into this API. The usage of this API looks like this:
```javascript
diagramMaker.api.layout({
  // config object
  ...
});
```

There are 2 types of layout:
#### Heirarchical

The configuration for this type of layout looks like this:
```javascript
interface HierarchicalLayoutConfig {
  layoutType: LayoutType.HIERARCHICAL;

  /**
   * List of nodes that must remain their positions.
   * All other nodes are arranged around these fixed nodes.
   */
  fixedNodeIds: string[];

  /**
   * Minimal distance between two nodes.
   */
  distanceMin: number;

  /**
   * Maximal distance between two nodes.
   * Defaults to `3 * distanceMin`.
   */
  distanceMax?: number;

  /**
   * Number from 0.0 to 1.0 representing how fast
   * the distance between two nodes declines with each layer.
   *
   *   `0.0` means it will always remain `distanceMax`
   *
   *   `1.0` means it will jump and stay at `distanceMin`
   *         starting from the second layer.
   *
   * Defaults to `0.3`.
   */
  distanceDeclineRate?: number;

  /**
   * Angle of gravity in radians.
   *
   *   `0.0` is rightward direction.
   *
   *   `Math.PI * 0.5` is upward direction.
   *
   * Defaults to `Math.PI * 1.5` (downward).
   */
  gravityAngle?: number;

  /**
   * Strength of gravity.
   *
   *   `0.0` disables the gravity.
   *
   *   `1.0` means that nodes push each other away
   *         with the equal force as gravity pulls them towards `gravityAngle`.
   *
   *   `2.0` means that gravity is twice as strong as nodes repulsion.
   *
   * Defaults to `0.0`.
   */
  gravityStrength?: number;
}
```

#### Workflow

The configuration for this type of layout looks like this:
```javascript
interface WorkflowLayoutConfig {
  layoutType: LayoutType.WORKFLOW;

  /**
   * Direction of the workflow.
   */
  direction: WorkflowLayoutDirectionType;

  /**
   * Minimal distance between two nodes.
   */
  distanceMin: number;

  /**
   * When provided, the position of `fixedNodeId` will remain the same after layout.
   * All other nodes will be layed out around this node.
   *
   * If not provided, the graph will be moved to top-left corner of the canvas.
   */
  fixedNodeId?: string;
}
```

```note

Please note that the workflow layout uses the library Dagre which is not included within the DiagramMaker package and not marked as a peer dependency. This is because not all consumers of this library use the workflow based layout API. Using this without importing Dagre will cause client side errors in your application. For using this layout, please installe dagre into your application like so:
`npm install dagre`
```

### Set Editor Mode
This API is used to switch editor modes. Usually this API is called when the user changes tools in the tools panel. There are 3 different editor modes currently supported:

* **Drag** - This is default mode. Clicking & Dragging on the canvas pans the workspace.
* **Select** - Clicking & Dragging on the canvas draws a selection marquee which selects all the nodes within its boundary.
* **Read Only** - Clicking & Dragging on the canvas pans the workspace. However, apart from this & the workspace zoom or mouse wheel, all other actions like node select, create, delete or edge select, create, delete are prevented.

The API is used like so:
```javascript
diagramMaker.api.setEditorMode(EditorMode.SELECT);
```

### Focus Node
This API moves around the workspace & adjusts the zoom to bring a given node into focus. Also, selects the given node. The API is used like so:
```javascript
diagramMaker.api.focusNode('myAwesomeNodeId')
```
The API also accepts optional arguments for fixed left panel & fixed right panel widths, so that the node gets centered within the visible container, rather than the entire container.
```javascript
// Left panel is 50px wide & right panel is 400px wide & both are fixed
diagramMaker.api.focusNode('myAwesomeNodeId', 50, 400);
```

### Focus Selected
This API moves around the workspace & adjusts the zoom to bring the selected node into focus. If only a single node is selected, this API behaves like focusNode, if multiple nodes are selected, this API behaves like fit. If no node is selected, it resets the zoom and centers the workspace. This API is used as follows:
```javascript
diagramMaker.api.focusSelected()
```
The API also accepts optional arguments for fixed left panel & fixed right panel widths, so that the node gets centered within the visible container, rather than the entire container.
```javascript
// Left panel is 50px wide & right panel is 400px wide & both are fixed
diagramMaker.api.focusSelected(50, 400);
```

### Fit
This API zooms out & pans the workspace such that all nodes are visible on the screen. The API is used like so:
```javascript
diagramMaker.api.fit()
```
The API also accepts optional arguments for fixed left panel & fixed right panel widths, so that the node gets centered within the visible container, rather than the entire container.
```javascript
// Left panel is 50px wide & right panel is 400px wide & both are fixed
diagramMaker.api.fit(50, 400);
```
The API also takes an optional 3rd argument which is a list of string IDs referring to the nodes to fit on the screen. This is used internally by focusSelected API when multiple nodes are selected.
```javascript
// Left panel is 50px wide & right panel is 400px wide & both are fixed
diagramMaker.api.fit(50, 400, ['myAwesomeNode1', 'myAwesomeNode2']);
```

### Zoom Out
This API zooms out the workspace keeping the center of the visible workspace as the origin for the zoom. By default it zooms by 50 units, but you can specify an argument which denotes the units by which to zoom.
```javascript
// Default zoom is 50 units
diagramMaker.api.zoomOut()
// You can specify the zoom
diagramMaker.api.zoomOut(100);
```

### Zoom In
This API zooms in the workspace keeping the center of the visible workspace as the origin for the zoom. By default it zooms by 50 units, but you can specify an argument which denotes the units by which to zoom.
```javascript
// Default zoom is 50 units
diagramMaker.api.zoomIn()
// You can specify the zoom
diagramMaker.api.zoomIn(100);
```

### Reset Zoom
This API resets the zoom to 1 & centers the workspace.
```javascript
diagramMaker.api.resetZoom();
```

### Undo
This API undoes the last undoable action. Currently, undoable actions include only node create, node delete, edge create & edge delete. Note that this API is no op if no undoable actions have been executed till now.
```javascript
diagramMaker.api.undo()
```

### Redo
This API redoes the last undone action. Note that this API is a no op if no actions have been undone yet.
```javascript
diagramMaker.api.redo()
```
### Dispatch
This API takes an arbitrary action and dispatches it onto the underlying store. Useful for plugins.
```javascript
diagramMaker.api.dispatch({
  type: 'myAwesomeAction',
  ...
})
```
