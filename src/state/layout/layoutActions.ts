import { Action } from 'redux';

export enum LayoutType {
  /** Layout used for heirarchical graphs. Used for tree type graph structures. */
  HIERARCHICAL = 'Hierarchical',
  /** Layout used for flow digrams. */
  WORKFLOW = 'Workflow',
}

export const Layout = {
  ...LayoutType,
};

export interface HierarchicalLayoutConfig {
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

export enum WorkflowLayoutDirectionType {
  /** Flow goes from top to bottom */
  TOP_BOTTOM = 'TopBottom',
  /** Flow goes from bottom to top */
  BOTTOM_TOP = 'BottomTop',
  /** Flow goes from left to right */
  LEFT_RIGHT = 'LeftRight',
  /** Flow goes from right to left */
  RIGHT_LEFT = 'RightLeft',
}

export const WorkflowLayoutDirection = {
  ...WorkflowLayoutDirectionType,
};

export interface WorkflowLayoutConfig {
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

export type LayoutConfig = HierarchicalLayoutConfig | WorkflowLayoutConfig;

export enum LayoutActionsType {
  /** Layout the nodes using auto layout */
  LAYOUT = 'LAYOUT',
}

export const LayoutActions = {
  ...LayoutActionsType,
};

export interface LayoutAction extends Action {
  type: LayoutActionsType.LAYOUT;
  payload: LayoutConfig;
}
