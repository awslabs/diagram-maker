import { Draft, produce } from 'immer';

import { constrainRectangleWithinRectangle } from 'diagramMaker/service/positionUtils';
import { DiagramMakerAction } from 'diagramMaker/state/actions';
import {
  DragPanelAction,
  DragStartPanelAction,
  PanelActionsType,
} from 'diagramMaker/state/panel/panelActions';
import {
  DiagramMakerPanels, Position, PositionAnchor, Size,
} from 'diagramMaker/state/types';

const ANCHOR_DISTANCE = 10;

const isPanelWithinAnchorBounds = (panelPosition: Position, panelSize: Size, containerSize: Size): boolean => {
  const { x, y } = panelPosition;

  const rightDistance = Math.abs(containerSize.width - (x + panelSize.width));
  const bottomDistance = Math.abs(containerSize.height - (y + panelSize.height));

  if ((x < ANCHOR_DISTANCE && y < ANCHOR_DISTANCE)
    || (rightDistance < ANCHOR_DISTANCE && y < ANCHOR_DISTANCE)
    || (x < ANCHOR_DISTANCE && bottomDistance < ANCHOR_DISTANCE)
    || (rightDistance < ANCHOR_DISTANCE && bottomDistance < ANCHOR_DISTANCE)
  ) {
    return true;
  }

  return false;
};

const anchorPanel = (
  draftState: Draft<DiagramMakerPanels>,
  action: DragPanelAction,
) => {
  const containerSize = action.payload.viewContainerSize;
  const currentPanel = draftState[action.payload.id];
  const { x, y } = currentPanel.position;

  const rightDistance = Math.abs(containerSize.width - (x + currentPanel.size.width));
  const bottomDistance = Math.abs(containerSize.height - (y + currentPanel.size.height));

  if (x < ANCHOR_DISTANCE && y < ANCHOR_DISTANCE) {
    currentPanel.positionAnchor = PositionAnchor.TOP_LEFT;
    currentPanel.position = { x: 0, y: 0 };
  } else if (rightDistance < ANCHOR_DISTANCE && y < ANCHOR_DISTANCE) {
    currentPanel.positionAnchor = PositionAnchor.TOP_RIGHT;
    currentPanel.position = { x: 0, y: 0 };
  } else if (x < ANCHOR_DISTANCE && bottomDistance < ANCHOR_DISTANCE) {
    currentPanel.positionAnchor = PositionAnchor.BOTTOM_LEFT;
    currentPanel.position = { x: 0, y: 0 };
  } else if (rightDistance < ANCHOR_DISTANCE && bottomDistance < ANCHOR_DISTANCE) {
    currentPanel.positionAnchor = PositionAnchor.BOTTOM_RIGHT;
    currentPanel.position = { x: 0, y: 0 };
  }
};

const dragStartReducer = (draftState: Draft<DiagramMakerPanels>, action: DragStartPanelAction) => {
  const currentPanel = draftState[action.payload.id];

  // When in undocking mode, we wait until panel is outside docking bounds
  // Before checking for docking again
  if (currentPanel.positionAnchor) {
    currentPanel.undocking = true;
  } else {
    currentPanel.undocking = false;
  }

  currentPanel.positionAnchor = undefined;
};

const dragReducer = (draftState: Draft<DiagramMakerPanels>, action: DragPanelAction) => {
  const currentPanel = draftState[action.payload.id];

  const { position, viewContainerSize } = action.payload;
  const { size } = currentPanel;

  currentPanel.position = constrainRectangleWithinRectangle(
    { position, size },
    { position: { x: 0, y: 0 }, size: viewContainerSize },
  );

  if (currentPanel.undocking) {
    const containerSize = viewContainerSize;

    // Once we are outside of anchor bounds, we are no longer in undocking mode
    if (!isPanelWithinAnchorBounds(currentPanel.position, currentPanel.size, containerSize)) {
      currentPanel.undocking = false;
    }
  } else {
    anchorPanel(draftState, action);
  }
};

export default function panelReducer<NodeType, EdgeType>(
  state: DiagramMakerPanels | undefined,
  action: DiagramMakerAction<NodeType, EdgeType>,
): DiagramMakerPanels {
  if (state === undefined) {
    return {};
  }
  switch (action.type) {
    case PanelActionsType.PANEL_RESIZE:
      return produce(state, (draftState) => {
        if (draftState[action.payload.id]) {
          draftState[action.payload.id].size = action.payload.size;
        }
      });
    case PanelActionsType.PANEL_DRAG:
      return produce(state, (draftState) => {
        if (draftState[action.payload.id] && !draftState[action.payload.id].positionAnchor) {
          dragReducer(draftState, action);
        }
      });
    case PanelActionsType.PANEL_DRAG_START:
      return produce(state, (draftState) => {
        if (draftState[action.payload.id]) {
          dragStartReducer(draftState, action);
        }
      });
    default:
      return state;
  }
}
