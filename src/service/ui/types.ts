export enum DiagramMakerComponentsType {
  /**
   * Used on context menus rendered by diagram maker.
   * For internal use only.
   */
  CONTEXT_MENU = 'DiagramMaker.ContextMenu',
  /**
   * Used on edges rendered by diagram maker.
   * For internal use only.
   */
  EDGE = 'DiagramMaker.Edge',
  /**
   * Used on edge badges rendered by diagram maker.
   * For internal use only.
   */
  EDGE_BADGE = 'DiagramMaker.EdgeBadge',
  /**
   * Used on potential edges rendered by diagram maker.
   * For internal use only.
   */
  POTENTIAL_EDGE = 'DiagramMaker.PotentialEdge',
  /**
   * Used on potential nodes being dragged currently by diagram maker.
   * Also used by consumers on the drag targets for potential nodes.
   */
  POTENTIAL_NODE = 'DiagramMaker.PotentialNode',
  /**
   * Used on nodes rendered by diagram maker.
   * For internal use only.
   */
  NODE = 'DiagramMaker.Node',
  /**
   * Used on node connectors displayed by diagram maker.
   * Can also be used within the node to make the entire node,
   * or parts of the node DOM be droppable for completion of edge creation
   * or draggable for starting edge creation.
   */
  NODE_CONNECTOR = 'DiagramMaker.Connector',
  /**
   * Used on panels rendered by diagram maker.
   * For internal use only.
   */
  PANEL = 'DiagramMaker.Panel',

  /**
   * Used as a drag handle on panels rendered by diagram maker.
   * If you give an element this data-type in the panel render callback
   * dragging this element will drag the panel
   */
  PANEL_DRAG_HANDLE = 'DiagramMaker.PanelDragHandle',

  /**
   * Used on selection marquee rendered by diagram maker in select mode.
   * For internal use only.
   */
  SELECTION_MARQUEE = 'DiagramMaker.SelectionMarquee',

  /**
   * Used on top level container rendered by diagram maker.
   * For internal use only.
   */
  VIEW = 'DiagramMaker.View',

  /**
   * Used on workspace rendered by diagram maker.
   * For internal use only.
   */
  WORKSPACE = 'DiagramMaker.Workspace',
}

export const DiagramMakerComponents = {
  ...DiagramMakerComponentsType,
};
