import { Action } from 'redux';

import { DiagramMakerComponentsType } from 'diagramMaker/service/ui/types';
import { EditorModeType, Position, Rectangle, Size } from 'diagramMaker/state/types';

export enum EditorActionsType {
  /** Set the mode for the editor. */
  SET_EDITOR_MODE = 'SET_EDITOR_MODE',
  /** Show the context menu. */
  SHOW_CONTEXT_MENU = 'SHOW_CONTEXT_MENU',
  /** Hide the context menu. */
  HIDE_CONTEXT_MENU = 'HIDE_CONTEXT_MENU',
  /** Show the selection marquee. */
  SHOW_SELECTION_MARQUEE = 'SHOW_SELECTION_MARQUEE',
  /** Update the selection marquee. */
  UPDATE_SELECTION_MARQUEE = 'UPDATE_SELECTION_MARQUEE',
  /** Hide the selection marquee. */
  HIDE_SELECTION_MARQUEE = 'HIDE_SELECTION_MARQUEE',
  /** Focus the given node */
  FOCUS_NODE = 'FOCUS_NODE',
  /** Fits all nodes into view */
  FIT = 'FIT'
}

export const EditorActions = {
  ...EditorActionsType
};

/** Action fired to set the mode for the editor */
export interface SetEditorModeAction extends Action {
  type: EditorActionsType.SET_EDITOR_MODE;
  payload: {
    /** Requested mode for the editor */
    mode: EditorModeType
  };
}

/** Action fired to show the context menu */
export interface ShowContextMenuAction extends Action {
  type: EditorActionsType.SHOW_CONTEXT_MENU;
  payload: {
    /** Position to render the context menu */
    position: Position,
    /** Type of UI Element to show the context menu for. */
    targetType: DiagramMakerComponentsType,
    /** ID of the UI Element in case it was a node, edge or a panel. */
    targetId?: string
  };
}

/** Action fired to hide the context menu */
export interface HideContextMenuAction extends Action {
  type: EditorActionsType.HIDE_CONTEXT_MENU;
}

/** Action fired to show the selection marquee */
export interface ShowSelectionMarqueeAction extends Action {
  type: EditorActionsType.SHOW_SELECTION_MARQUEE;
  payload: {
    /**
     * Position to anchor the selection marquee.
     * Usually the position where mouse was clicked to start the selection.
     */
    anchor: Position
  };
}

/** Action fired to update the selection marquee */
export interface UpdateSelectionMarqueeAction extends Action {
  type: EditorActionsType.UPDATE_SELECTION_MARQUEE;
  payload: {
    /**
     * Position to anchor the selection marquee.
     * Usually the position where mouse was clicked to start the selection.
     */
    anchor: Position,
    /** The diagonally opposite corner from the anchor. Usually the current mouse position. */
    position: Position
  };
}

/** Action fired to hide the selection marquee */
export interface HideSelectionMarqueeAction extends Action {
  type: EditorActionsType.HIDE_SELECTION_MARQUEE;
}

/** Action fired to focus on a specific node */
export interface FocusNodeAction extends Action {
  type: EditorActionsType.FOCUS_NODE;
  payload: {
    /** ID of the node to focus */
    id: string;
    /** position of the node to focus */
    position: Position;
    /** size of the node to focus */
    size: Size;
    /** Width of fixed left panel */
    leftPanelWidth?: number;
    /** Width of fixed right panel */
    rightPanelWidth?: number;
  };
}

/** Action fired to fit all nodes into view */
export interface FitAction extends Action {
  type: EditorActionsType.FIT;
  payload: {
    /** Position & sizes of nodes that need to be fit into view */
    nodeRects: Rectangle[],
    /** Width of fixed left panel */
    leftPanelWidth?: number;
    /** Width of fixed right panel */
    rightPanelWidth?: number;
  };
}

export type EditorAction =
  SetEditorModeAction | ShowContextMenuAction | HideContextMenuAction | ShowSelectionMarqueeAction |
  UpdateSelectionMarqueeAction | HideSelectionMarqueeAction | FocusNodeAction | FitAction;
