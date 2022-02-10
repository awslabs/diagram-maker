import { AnyAction, Store } from 'redux';
import { actions as undoActions } from 'redux-undo-redo';

import {
  createFitAction, createFocusNodeAction, createSetEditorModeAction,
} from 'diagramMaker/state/editor/editorActionDispatcher';
import { createLayoutAction, LayoutConfig } from 'diagramMaker/state/layout';
import { DiagramMakerData, EditorModeType } from 'diagramMaker/state/types';
import {
  createWorkspaceResetZoomAction, createZoomWorkspaceAction,
} from 'diagramMaker/state/workspace/workspaceActionDispatcher';

const DEFAULT_ZOOM_DELTA = 50;

export default class DiagramMakerApi<NodeType = {}, EdgeType = {}> {
  constructor(
    private store: Store<DiagramMakerData<NodeType, EdgeType>>,
  ) {}

  /**
   * Arranges nodes according to the specified layout type.
   *
   * @param {LayoutConfig} layoutConfig - Layout type and its parameters.
   * @returns {DiagramMakerApi} - Returns this `DiagramMakerApi` instance for method chaining.
   *
   * NOTE FOR "WORKFLOW" LAYOUT:
   * "Workflow" layout uses Dagre library underneath:
   * https://github.com/dagrejs/dagre
   *
   * We don't bundle it with DiagramMaker, as not all consumers need this functionality.
   * To use "Workflow" layout, you'll need to add Dagre library to your package.json.
   */
  public layout(layoutConfig: LayoutConfig): DiagramMakerApi<NodeType, EdgeType> {
    this.store.dispatch(createLayoutAction(layoutConfig));
    return this;
  }

  /**
   * Sets the editor to the given mode, in order to modify its UI behavior.
   *
   * @param {EditorModeType} mode - The mode to set the editor to.
   * @returns {DiagramMakerApi} - Returns this `DiagramMakerApi` instance for method chaining.
   */
  public setEditorMode(mode: EditorModeType): DiagramMakerApi<NodeType, EdgeType> {
    this.store.dispatch(createSetEditorModeAction(mode));
    return this;
  }

  /**
   * Moves the workspace around to center the node matching the passed ID.
   * Also selects the corresponding node.
   *
   * @param {string} nodeId - ID of the node to focus
   * @param {number} [leftPanelWidth] - Width of the fixed left panel
   * @param {number} [rightPanelWidth] - Width of the fixed right panel
   * @returns {DiagramMakerApi} - Returns this `DiagramMakerApi` instance for method chaining.
   */
  public focusNode(
    nodeId: string,
    leftPanelWidth?: number,
    rightPanelWidth?: number,
  ): DiagramMakerApi<NodeType, EdgeType> {
    const nodeState = this.store.getState().nodes[nodeId];
    if (nodeState) {
      const { position, size } = nodeState.diagramMakerData;
      this.store.dispatch(createFocusNodeAction(nodeId, position, size, leftPanelWidth, rightPanelWidth));
    }
    return this;
  }

  /**
   * Moves the workspace around to center the selected node.
   * If more than 1 nodes are selected, it falls back to fitting the selected nodes in.
   * If no nodes are selected, this resets the zoom & centers the workspace.
   *
   * @param {number} [leftPanelWidth] - Width of the fixed left panel
   * @param {number} [rightPanelWidth] - Width of the fixed right panel
   * @returns {DiagramMakerApi} - Returns this `DiagramMakerApi` instance for method chaining.
   */
  public focusSelected(leftPanelWidth?: number, rightPanelWidth?: number): DiagramMakerApi<NodeType, EdgeType> {
    const state = this.store.getState();
    const nodeKeys = Object.keys(state.nodes);
    const selectedNodes = nodeKeys.filter((nodeKey) => state.nodes[nodeKey].diagramMakerData.selected);
    if (selectedNodes.length === 0) {
      this.resetZoom();
    } else if (selectedNodes.length === 1) {
      this.focusNode(selectedNodes[0]);
    } else {
      this.fit(leftPanelWidth, rightPanelWidth, selectedNodes);
    }
    return this;
  }

  /**
   * Zooms out & pans the workspace such that all nodes are visible in the screen.
   *
   * @param {number} [leftPanelWidth] - Width of the fixed left panel
   * @param {number} [rightPanelWidth] - Width of the fixed right panel
   * @param {string[]} [nodeKeys] - Optional. List of node IDs which need to be fit in the screen,
   * Defaults to fitting all the nodes.
   * @returns {DiagramMakerApi} - Returns this `DiagramMakerApi` instance for method chaining.
   */
  public fit(
    leftPanelWidth?: number,
    rightPanelWidth?: number,
    nodeKeys?: string[],
  ): DiagramMakerApi<NodeType, EdgeType> {
    const state = this.store.getState();
    const nodesToFit = nodeKeys || Object.keys(state.nodes);
    const nodeRects = nodesToFit.map((nodeKey) => ({
      position: state.nodes[nodeKey].diagramMakerData.position,
      size: state.nodes[nodeKey].diagramMakerData.size,
    }));
    this.store.dispatch(createFitAction(nodeRects, leftPanelWidth, rightPanelWidth));
    return this;
  }

  /**
   * Zooms in one level into the diagram maker workspace at the center.
   *
   * @param {number} [zoom=50] - Zoom factor to zoom by
   * @returns {DiagramMakerApi} - Returns this `DiagramMakerApi` instance for method chaining.
   */
  public zoomIn(zoom = DEFAULT_ZOOM_DELTA): DiagramMakerApi<NodeType, EdgeType> {
    this.workspaceZoom(zoom);
    return this;
  }

  /**
   * Zooms out one level into the diagram maker workspace at the center.
   *
   * @param {number} [zoom=50] - Zoom factor to zoom by
   * @returns {DiagramMakerApi} - Returns this `DiagramMakerApi` instance for method chaining.
   */
  public zoomOut(zoom = DEFAULT_ZOOM_DELTA): DiagramMakerApi<NodeType, EdgeType> {
    this.workspaceZoom(-zoom);
    return this;
  }

  /**
   * Resets the zoom to base level.
   *
   * @returns {DiagramMakerApi} - Returns this `DiagramMakerApi` instance for method chaining.
   */
  public resetZoom(): DiagramMakerApi<NodeType, EdgeType> {
    this.store.dispatch(createWorkspaceResetZoomAction());
    return this;
  }

  /**
   * Undo the last undoable action.
   *
   * @returns {DiagramMakerApi} - Returns this `DiagramMakerApi` instance for method chaining.
   */
  public undo() {
    this.store.dispatch(undoActions.undo());
    return this;
  }

  /**
   * Redo the last undone action.
   *
   * @returns {DiagramMakerApi} - Returns this `DiagramMakerApi` instance for method chaining.
   */
  public redo() {
    this.store.dispatch(undoActions.redo());
    return this;
  }

  /**
   * dispatch a action, for plugin use
   */
  public dispatch(action: AnyAction) {
    this.store.dispatch(action);
  }

  private workspaceZoom(zoom: number) {
    const { viewContainerSize } = this.store.getState().workspace;
    const position = {
      x: viewContainerSize.width / 2,
      y: viewContainerSize.height / 2,
    };
    this.store.dispatch(createZoomWorkspaceAction(zoom, position));
  }
}
