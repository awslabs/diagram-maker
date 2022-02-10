import { Store } from 'redux';

import ConfigService from 'diagramMaker/service/ConfigService';
import { DiagramMakerComponentsType } from 'diagramMaker/service/ui/types';
import { NormalizedMouseClickEvent } from 'diagramMaker/service/ui/UIEventNormalizer';
import {
  DiagramMakerData, EditorModeType, Position, Rectangle, Size,
} from 'diagramMaker/state/types';

import {
  EditorActionsType,
  FitAction,
  FocusNodeAction,
  HideContextMenuAction,
  HideSelectionMarqueeAction,
  SetEditorModeAction,
  ShowContextMenuAction,
  ShowSelectionMarqueeAction,
  UpdateSelectionMarqueeAction,
} from './editorActions';

function createHideContextMenuAction(): HideContextMenuAction {
  return {
    type: EditorActionsType.HIDE_CONTEXT_MENU,
  };
}

function createShowContextMenuAction(
  position: Position,
  targetType: DiagramMakerComponentsType,
  targetId?: string,
): ShowContextMenuAction {
  return {
    type: EditorActionsType.SHOW_CONTEXT_MENU,
    payload: {
      position,
      targetType,
      targetId,
    },
  };
}

function createShowSelectionMarqueeAction(anchor: Position): ShowSelectionMarqueeAction {
  return {
    type: EditorActionsType.SHOW_SELECTION_MARQUEE,
    payload: {
      anchor,
    },
  };
}

function createUpdateSelectionMarqueeAction(anchor: Position, position: Position): UpdateSelectionMarqueeAction {
  return {
    type: EditorActionsType.UPDATE_SELECTION_MARQUEE,
    payload: {
      anchor,
      position,
    },
  };
}

function createHideSelectionMarqueeAction(): HideSelectionMarqueeAction {
  return {
    type: EditorActionsType.HIDE_SELECTION_MARQUEE,
  };
}

export function createSetEditorModeAction(mode: EditorModeType): SetEditorModeAction {
  return {
    type: EditorActionsType.SET_EDITOR_MODE,
    payload: { mode },
  };
}

export function createFocusNodeAction(
  id: string,
  position: Position,
  size: Size,
  leftPanelWidth?: number,
  rightPanelWidth?: number,
): FocusNodeAction {
  return {
    type: EditorActionsType.FOCUS_NODE,
    payload: {
      id, position, size, leftPanelWidth, rightPanelWidth,
    },
  };
}

export function createFitAction(nodeRects: Rectangle[], leftPanelWidth?: number, rightPanelWidth?: number): FitAction {
  return {
    type: EditorActionsType.FIT,
    payload: { nodeRects, leftPanelWidth, rightPanelWidth },
  };
}

export function handleShowContextMenu<NodeType, EdgeType>(
  store: Store<DiagramMakerData<NodeType, EdgeType>>,
  config: ConfigService<NodeType, EdgeType>,
  event: NormalizedMouseClickEvent,
) {
  const { originalEvent, position, target } = event;
  const { type, id } = target;
  if (type) {
    const renderContextMenu = config.getBoundRenderContextMenu(type, id);
    if (renderContextMenu) {
      originalEvent.preventDefault();
      const action = createShowContextMenuAction(position, type as DiagramMakerComponentsType, id);

      store.dispatch(action);
    }
  }
}

export function handleHideContextMenu<NodeType, EdgeType>(
  store: Store<DiagramMakerData<NodeType, EdgeType>>,
) {
  const state = store.getState();
  if (state.editor && state.editor.contextMenu) {
    const action = createHideContextMenuAction();

    store.dispatch(action);
  }
}

export function handleShowSelectionMarquee<NodeType, EdgeType>(
  store: Store<DiagramMakerData<NodeType, EdgeType>>,
  anchor: Position,
) {
  const action = createShowSelectionMarqueeAction(anchor);

  store.dispatch(action);
}

export function handleUpdateSelectionMarquee<NodeType, EdgeType>(
  store: Store<DiagramMakerData<NodeType, EdgeType>>,
  position: Position,
) {
  const state = store.getState();
  if (state.editor.selectionMarquee) {
    const { anchor } = state.editor.selectionMarquee;
    const action = createUpdateSelectionMarqueeAction(anchor, position);

    store.dispatch(action);
  }
}

export function handleHideSelectionMarquee<NodeType, EdgeType>(
  store: Store<DiagramMakerData<NodeType, EdgeType>>,
) {
  const state = store.getState();
  if (state.editor.selectionMarquee) {
    const action = createHideSelectionMarqueeAction();

    store.dispatch(action);
  }
}
