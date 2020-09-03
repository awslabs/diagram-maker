import { DiagramMakerComponentsType } from 'diagramMaker/service/ui/types';
import { ActionInterceptor } from 'diagramMaker/state/middleware';
import {
  DiagramMakerData, DiagramMakerEdge, DiagramMakerNode, DiagramMakerPanel, DiagramMakerPotentialNode, Size
} from 'diagramMaker/state/types';

export enum ConnectorPlacementType {
  /**
   * Allows edges to be start & end at the boundary of the node.
   * This falls back to CENTERED if the shape is not known for any given node.
   * Doesn't render connectors by default.
   */
  BOUNDARY = 'Boundary',
  /**
   * Edges start & end at the geometric center of the node.
   * Doesn't render connectors by default.
   */
  CENTERED = 'Centered',
  /**
   * Edges start at the right edge & end at the left edge of node bounding box.
   * Does render connectors by default.
   */
  LEFT_RIGHT = 'LeftRight',
  /**
   * Edges start at the bottom edge & end at the top edge of node bounding box.
   * Does render connectors by default.
   */
  TOP_BOTTOM = 'TopBottom'
}

export const ConnectorPlacement = {
  ...ConnectorPlacementType
};

export type BoundRenderCallback = (
  diagramMakerContainer: HTMLElement,
  consumerContainer?: HTMLElement | void
) => (HTMLElement | undefined | void);

/**
 * This callback is called to cleanup event handlers for DOM rendered by the consumer
 * before diagram maker removes the DOM.
 * @callback DestroyCallback
 * @param diagramMakerContainer - The container in which consumer rendered some DOM.
 * @param consumerContainer - This is passed only if the consumer returned this in renderCallback.
 * Useful for Preact, where you need to provide the element within the container to diff against.
 * @returns {void}
 * @example <caption> Destroy callback when using React </caption>
 * (diagramMakerContainer: HTMLElement) => ReactDOM.unmountComponentAtNode(diagramMakerContainer)
 */
export type DestroyCallback = (
  diagramMakerContainer: HTMLElement,
  consumerContainer?: HTMLElement | void
) => void;

/**
 * This callback is called to render context menu for elements with IDs like node, edge, panel.
 * @callback ContextMenuRenderCallbackWithId
 * @param id - The ID of the element which was clicked. Since, we have different callbacks for node, edge, panel,
 * it is assumed that the type of the element is known before hand.
 * @param diagramMakerContainer - The container in which the consumer renders the context menu.
 * This is an empty container with only the position set correctly.
 * Could diff against content already present in the container using React, Preact or any other VDOM.
 * @param consumerContainer - This is passed only if the consumer returned this in prior calls to this callback.
 * Useful for Preact, where you need to provide the element within the container to diff against.
 * @returns {HTMLElement | undefined | void} - HTMLElement in case of Preact, or void or undefined everywhere else.
 */
type ContextMenuRenderCallbackWithId = (
  id: string | undefined,
  diagramMakerContainer: HTMLElement,
  consumerContainer?: HTMLElement | void
) => (HTMLElement | undefined | void);

/**
 * This callback is called to render context menu for elements without IDs like workspace.
 * Since, we have different callbacks for node, edge, panel,
 * it is assumed that the type of the element is known before hand.
 * @callback ContextMenuRenderCallback
 * @param diagramMakerContainer - The container in which the consumer renders the context menu.
 * This is an empty container with only the position set correctly.
 * Could diff against content already present in the container using React, Preact or any other VDOM.
 * @param consumerContainer - This is passed only if the consumer returned this in prior calls to this callback.
 * Useful for Preact, where you need to provide the element within the container to diff against.
 * @returns {HTMLElement | undefined | void} - HTMLElement in case of Preact, or void or undefined everywhere else.
 */
type ContextMenuRenderCallback = (
  diagramMakerContainer: HTMLElement,
  consumerContainer?: HTMLElement | void
) => (HTMLElement | undefined | void);

/**
 * Object containing render callbacks for context menu.
 */
export interface ContextMenuRenderCallbacks {
  /**
   * Render callback for context menu for node. Optional.
   * @type {ContextMenuRenderCallbackWithId}
   */
  node?: ContextMenuRenderCallbackWithId;
  /**
   * Render callback for context menu for edge. Optional.
   * @type {ContextMenuRenderCallbackWithId}
   */
  edge?: ContextMenuRenderCallbackWithId;
  /**
   * Render callback for context menu for panel. Optional.
   * @type {ContextMenuRenderCallbackWithId}
   */
  panel?: ContextMenuRenderCallbackWithId;
  /**
   * Render callback for context menu for workspace. Optional.
   * @type {ContextMenuRenderCallback}
   */
  workspace?: ContextMenuRenderCallback;
}

/** Object containing callbacks for rendering & destroying various entities (like nodes, edges, panels, etc) */
interface RenderCallbacks<NodeType, EdgeType> {
  /**
   * Callback to cleanup DOM rendered by the consumer properly
   * before diagram maker removes it.
   * In case, consumers are using React or any other rendering framework,
   * the framework attaches event handlers that if not removed correctly,
   * could cause a memory leak.
   * @type {DestroyCallback}
   */
  destroy: DestroyCallback;
  /**
   * Callback to render a badge centered within the edge.
   * @param {DiagramMakerEdge<EdgeType>} - The object representing the current state of the edge
   * for which the badge is being rendered.
   * @param {HTMLElement} diagramMakerContainer - Container managed by diagram maker to render content in
   * Could diff against content already present in the container using React, Preact or any other VDOM.
   * @param {HTMLElement} consumerContainer - Container used by consumer to render. Optional.
   * Useful only when using Preact, since Preact appends by default
   * and needs an Element to diff against in the container.
   * @returns {HTMLElement | undefined | void} - Element rendered by consumer when using Preact,
   * or undefined or void everywhere else.
   */
  edge?: (
    edge: DiagramMakerEdge<EdgeType>,
    diagramMakerContainer: HTMLElement,
    consumerContainer?: HTMLElement | void
  ) => (HTMLElement | undefined | void);
  /**
   * Callback to render a node.
   * @param {DiagramMakerNode<NodeType>} - The object representing the current state of the node being rendered.
   * @param {HTMLElement} diagramMakerContainer - Container managed by diagram maker to render content in
   * Could diff against content already present in the container using React, Preact or any other VDOM.
   * @param {HTMLElement} consumerContainer - Container used by consumer to render. Optional.
   * Useful only when using Preact, since Preact appends by default
   * and needs an Element to diff against in the container.
   * @returns {HTMLElement | undefined | void} - Element rendered by consumer when using Preact,
   * or undefined or void everywhere else.
   */
  node: (
    node: DiagramMakerNode<NodeType>,
    diagramMakerContainer: HTMLElement,
    consumerContainer?: HTMLElement | void
  ) => (HTMLElement | undefined | void);
  /**
   * Callback to render a potential node. Optional. Only useful when user might be dragging new nodes out of a panel.
   * @param {DiagramMakerPotentialNode} - The object representing the current state of the potential node
   * being rendered.
   * @param {HTMLElement} diagramMakerContainer - Container managed by diagram maker to render content in
   * Could diff against content already present in the container using React, Preact or any other VDOM.
   * @param {HTMLElement} consumerContainer - Container used by consumer to render. Optional.
   * Useful only when using Preact, since Preact appends by default
   * and needs an Element to diff against in the container.
   * @returns {HTMLElement | undefined | void} - Element rendered by consumer when using Preact,
   * or undefined or void everywhere else.
   */
  potentialNode?: (
    node: DiagramMakerPotentialNode,
    diagramMakerContainer: HTMLElement,
    consumerContainer?: HTMLElement | void
  ) => (HTMLElement | undefined | void);
  /** Object containing render callbacks for several panels keyed on panel name */
  panels: {
    /**
     * Callback to render a panel.
     * @param {DiagramMakerPanel} - The object representing the current state of the panel being rendered.
     * @param {HTMLElement} diagramMakerContainer - Container managed by diagram maker to render content in
     * Could diff against content already present in the container using React, Preact or any other VDOM.
     * @param {HTMLElement} consumerContainer - Container used by consumer to render. Optional.
     * Useful only when using Preact, since Preact appends by default
     * and needs an Element to diff against in the container.
     * @returns {HTMLElement | undefined | void} - Element rendered by consumer when using Preact,
     * or undefined or void everywhere else.
     */
    [name: string]: (
      panel: DiagramMakerPanel,
      state: DiagramMakerData<NodeType, EdgeType>,
      diagramMakerContainer: HTMLElement,
      consumerContainer?: HTMLElement | void
    ) => (HTMLElement | undefined | void);
  };
  /**
   * Object containing render callbacks for context menus for various targets. Optional.
   * If provided, diagram maker will use these context menu render callbacks to show a context menu,
   * and suppress the browser rendered context menu.
   */
  contextMenu?: ContextMenuRenderCallbacks;
}

export enum TypeForVisibleConnectorTypes {
  /** Render both input & output connectors. Default Behavior. */
  BOTH = 'Both',
  /** Render only input connector. */
  INPUT_ONLY = 'Input',
  /** Render only output connector. */
  OUTPUT_ONLY = 'Output',
  /** Render none of the connectors. */
  NONE = 'None'
}

export const VisibleConnectorTypes = {
  ...TypeForVisibleConnectorTypes
};

export enum ShapeType {
  /**
   * Denotes a circle shaped node.
   * Assumes that node width & height are equal
   * and the radius is equal to half of each of them
   */
  CIRCLE = 'Circle'
}

export const Shape = {
  ...ShapeType
};

/** Interface for storing configuration for a given node type */
export interface DiagramMakerNodeTypeConfiguration {
  /**
   * Size used if override not provided by data attrs for potential nodes using this type.
   */
  size: Size;
  /**
   * Used for overriding visible connectors for nodes using this type.
   * This is useful only in case diagram maker renders connectors by default i.e. LEFT_RIGHT or TOP_BOTTOM.
   */
  visibleConnectorTypes?: TypeForVisibleConnectorTypes;
  /**
   * Used for overriding the connector placement for nodes using this type.
   */
  connectorPlacementOverride?: ConnectorPlacementType;
  /**
   * Used for providing shape for nodes using this type.
   * Used in conjunction with BOUNDARY connector placement.
   */
  shape?: ShapeType;
}

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
export default class ConfigService<NodeType, EdgeType> {
  constructor(private config: DiagramMakerConfig<NodeType, EdgeType>) {
  }

  public getRenderNode = (): (
    node: DiagramMakerNode<NodeType>,
    diagramMakerContainer: HTMLElement,
    consumerContainer?: HTMLElement | void
  ) => (HTMLElement | undefined | void) => {
    return this.getRenderCallbacks().node;
  }

  public getRenderEdge = (): ((
    edge: DiagramMakerEdge<EdgeType>,
    diagramMakerContainer: HTMLElement,
    consumerContainer?: HTMLElement | void
  ) => (HTMLElement | undefined | void)) | undefined => {
    return this.getRenderCallbacks().edge;
  }

  public getRenderPanel = (name: string): (
    panel: DiagramMakerPanel,
    state: DiagramMakerData<NodeType, EdgeType>,
    diagramMakerContainer: HTMLElement,
    consumerContainer?: HTMLElement | void
  ) => (HTMLElement | undefined | void) => {
    return this.getRenderCallbacks().panels[name];
  }

  public getRenderPotentialNode = (): ((
    node: DiagramMakerPotentialNode,
    diagramMakerContainer: HTMLElement,
    consumerContainer?: HTMLElement | void
  ) => (HTMLElement | undefined | void)) | undefined => {
    return this.getRenderCallbacks().potentialNode;
  }

  public getRenderDestroy = (): DestroyCallback => {
    return this.getRenderCallbacks().destroy;
  }

  public getBoundRenderContextMenu = (type: string, id?: string): BoundRenderCallback | undefined => {
    const contextMenuCallbacks = this.getRenderContextMenu();
    if (!contextMenuCallbacks) {
      return;
    }

    switch (type) {
      case DiagramMakerComponentsType.NODE:
        return contextMenuCallbacks.node && contextMenuCallbacks.node.bind(null, id);
      case DiagramMakerComponentsType.EDGE:
        return contextMenuCallbacks.edge && contextMenuCallbacks.edge.bind(null, id);
      case DiagramMakerComponentsType.PANEL:
        return contextMenuCallbacks.panel && contextMenuCallbacks.panel.bind(null, id);
      case DiagramMakerComponentsType.WORKSPACE:
        return contextMenuCallbacks.workspace;
    }
  }

  public getConnectorPlacement = (): ConnectorPlacementType => {
    return (this.config.options && this.config.options.connectorPlacement) || ConnectorPlacement.CENTERED;
  }

  public getShowArrowhead = (): boolean => {
    return (this.config.options && this.config.options.showArrowhead) || false;
  }

  public getActionInterceptor = (): ActionInterceptor<NodeType, EdgeType> | undefined => {
    return this.config.actionInterceptor;
  }

  public getSizeForNodeType = (typeId: string): Size | undefined => {
    const typeConfig = this.getNodeTypeConfiguration(typeId);
    return typeConfig && typeConfig.size;
  }

  public getConnectorPlacementForNodeType = (typeId: string): ConnectorPlacementType => {
    const typeConfig = this.getNodeTypeConfiguration(typeId);
    return (typeConfig && typeConfig.connectorPlacementOverride) || this.getConnectorPlacement();
  }

  public getShapeForNodeType = (typeId: string): ShapeType | undefined => {
    const typeConfig = this.getNodeTypeConfiguration(typeId);
    return typeConfig && typeConfig.shape;
  }

  public getVisibleConnectorTypesForNodeType = (typeId: string): TypeForVisibleConnectorTypes | undefined => {
    const typeConfig = this.getNodeTypeConfiguration(typeId);
    return typeConfig && typeConfig.visibleConnectorTypes;
  }

  private getNodeTypeConfiguration = (typeId: string): DiagramMakerNodeTypeConfiguration | undefined => {
    return this.config.nodeTypeConfig && this.config.nodeTypeConfig[typeId];
  }

  private getRenderContextMenu = (): ContextMenuRenderCallbacks | undefined => {
    return this.getRenderCallbacks().contextMenu;
  }

  private getRenderCallbacks = (): RenderCallbacks<NodeType, EdgeType> => {
    return this.config.renderCallbacks;
  }
}
