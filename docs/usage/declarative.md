---
sort: 6
---

# Declarative DOM APIs
Diagram Maker exposes several declarative DOM APIs that allow you to just add a few data attributes to the DOM content you render and then avoid having to detect user interaction and fire actions into diagram maker.

## Dragging new nodes onto the canvas
For dragging new nodes onto the canvas, you could fire a combination of `PotentialNodeDragStart`, `PotentialNodeDrag`, `PotentialNodeDragEnd`, and `NodeCreate` actions. However, an easier way to do it is by adding a few data attributes to the the DOM element that displays a node within the panel that lists all the nodes.
```jsx
{/* Using JSX */}
<div
  data-event-target={true}
  data-draggable={true}
  data-type={DiagramMakerComponents.POTENTIAL_NODE}
  data-id={typeId}
>
  {nodeText}
</div>
```

The above example assumes that the size for the node is supplied via node type configuration. However, you can supply the size using data attributes as well:
```jsx
{/* Using JSX */}
<div
  data-event-target={true}
  data-draggable={true}
  data-type={DiagramMakerComponents.POTENTIAL_NODE}
  data-id={typeId}
  data-width={width}
  data-height={height}
>
  {nodeText}
</div>
```

## Customizing the Node connectors
In case the default connectors rendered by diagram maker don't suffice, you can render your own connectors. You just need to add some data attributes, to make it function like a connector for a node. For example, to make an input connector, just add these data attributes:
```jsx
{/* Using JSX */}
<div>
  <div
    data-event-target="true"
    data-dropzone="true"
    data-type={DiagramMakerComponents.NODE_CONNECTOR}
    data-id={nodeId}
  >
    {customInputConnector}
  </div>
  {nodeContent}
</div>
```

Similarly, for output connector:
```jsx
{/* Using JSX */}
<div>
  {nodeContent}
  <div
    data-event-target="true"
    data-draggable="true"
    data-type={DiagramMakerComponents.NODE_CONNECTOR}
    data-id={nodeId}
  >
    {customOutputConnector}
  </div>
</div>
```
Please note that diagram maker will still render default connectors based on your chosen configuration. If you wish to suppress that, please use CSS overrides.

## Allowing users to drag the panels around
Panels by default, stick to their position. However, if you want, you can easily allow your users to drag the panels around to customize their editor experience. To do this simply create a drag handle, the DOM element that when clicked & dragged, the entire panel drags along with it. We cannot make the entire panel draggable because then the content within it, becomes uninteractable. After that, you only need to add a few data attributes to make diagram maker aware of this drag handle:
```jsx
{/* Using JSX */}
<div>
  <div
    data-event-target="true"
    data-draggable="true"
    data-type={DiagramMakerComponents.PANEL_DRAG_HANDLE}
    data-id={panelId}
  >
    {customDragHandle}
  </div>
  {panelContent}
</div>
```

## Having interactive content within Nodes like inputs, dropdowns, etc
If there are any interaction handlers attached to elements within the node, by default they would let the event bubble up to the node which might cause unintended side effects. One way to handle such cases would be to stop propagation of the event. Another way however, is using the data attributes that diagram maker allows in customer rendered content: data-event-target & data-draggable.
```jsx
{/* Using JSX */}
<div>
  Node Content
  <div
    data-event-target="true"
    data-draggable="true"
  >
    Interactive Node content
  </div>
</div>
```
