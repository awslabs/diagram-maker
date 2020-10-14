import { Store } from 'redux';

import ConfigService from 'diagramMaker/service/ConfigService';
import Observer from 'diagramMaker/service/observer/Observer';
import { subtract } from 'diagramMaker/service/positionUtils';
import { DiagramMakerComponentsType } from 'diagramMaker/service/ui/types';
import {
  ContainerEventType,
  DragEventType,
  DropEventType,
  EventType,
  KeyboardEventType,
  MouseClickEventType,
  MouseMoveEventType,
  WheelEventType,
  WindowEventType
} from 'diagramMaker/service/ui/UIEventManager';
import {
  KeyboardCode,
  KeyboardKey,
  NormalizedContainerEvent,
  NormalizedDragEvent,
  NormalizedDropEvent,
  NormalizedEvent,
  NormalizedKeyboardEvent,
  NormalizedMouseClickEvent,
  NormalizedMouseMoveEvent,
  NormalizedMouseScrollEvent,
  NormalizedWindowEvent
} from 'diagramMaker/service/ui/UIEventNormalizer';
import UITargetNormalizer from 'diagramMaker/service/ui/UITargetNormalizer';
import {
  handleEdgeClick, handleEdgeCreate, handleEdgeDrag, handleEdgeDragEnd, handleEdgeDragStart
} from 'diagramMaker/state/edge/edgeActionDispatcher';
import {
  handleHideContextMenu,
  handleHideSelectionMarquee,
  handleShowContextMenu,
  handleShowSelectionMarquee,
  handleUpdateSelectionMarquee
} from 'diagramMaker/state/editor/editorActionDispatcher';
import { handleDeleteSelectedItems } from 'diagramMaker/state/global/globalActionDispatcher';
import { rootEventFilter } from 'diagramMaker/state/mode';
import {
  handleNodeClick,
  handleNodeCreate,
  handleNodeDrag,
  handleNodeDragEnd,
  handleNodeDragStart,
  handlePotentialNodeDrag,
  handlePotentialNodeDragEnd,
  handlePotentialNodeDragStart
} from 'diagramMaker/state/node/nodeActionDispatcher';
import {
  handlePanelDrag,
  handlePanelDragStart
} from 'diagramMaker/state/panel/panelActionDispatcher';

import { DiagramMakerData, DiagramMakerWorkspace, EditorMode, Position } from 'diagramMaker/state/types';
import {
  handleSelectAll,
  handleWorkspaceClick,
  handleWorkspaceDrag,
  handleWorkspaceResize,
  handleWorkspaceZoom
} from 'diagramMaker/state/workspace/workspaceActionDispatcher';

const DATA_ATTR_TYPE = 'data-type';
export default class ActionDispatcher<NodeType, EdgeType> {
  constructor(
    private observer: Observer,
    private store: Store<DiagramMakerData<NodeType, EdgeType>>,
    private config: ConfigService<NodeType, EdgeType>
  ) {

    this.subscribeToUIEvents();
  }

  private subscribeToUIEvents() {
    const { LEFT_CLICK, RIGHT_CLICK, MOUSE_UP, MOUSE_DOWN } = MouseClickEventType;
    const { MOUSE_MOVE } = MouseMoveEventType;
    const { DRAG, DRAG_START, DRAG_END } = DragEventType;
    const { DROP, DRAG_ENTER, DRAG_LEAVE, DRAG_OVER } = DropEventType;
    const { MOUSE_WHEEL } = WheelEventType;
    const { KEY_DOWN, KEY_UP, KEY_PRESS } = KeyboardEventType;
    const { RESIZE } = WindowEventType;
    const { DIAGRAM_MAKER_CONTAINER_UPDATE } = ContainerEventType;

    this.subscribeWithFilter(LEFT_CLICK, this.handleLeftMouseClick);
    this.subscribeWithFilter(RIGHT_CLICK, this.handleRightMouseClick);
    this.subscribeWithFilter(MOUSE_UP, this.handleMouseUp);
    this.subscribeWithFilter(MOUSE_DOWN, this.handleMouseDown);
    this.subscribeWithFilter(MOUSE_MOVE, this.handleMouseMove);
    this.subscribeWithFilter(DRAG, this.handleDrag);
    this.subscribeWithFilter(DRAG_START, this.handleDragStart);
    this.subscribeWithFilter(DRAG_ENTER, this.handleDragEnter);
    this.subscribeWithFilter(DRAG_LEAVE, this.handleDragLeave);
    this.subscribeWithFilter(DRAG_OVER, this.handleDragOver);
    this.subscribeWithFilter(DRAG_END, this.handleDragEnd);
    this.subscribeWithFilter(DROP, this.handleDrop);
    this.subscribeWithFilter(RESIZE, this.handleWindowResize);
    this.subscribeWithFilter(DIAGRAM_MAKER_CONTAINER_UPDATE, this.handleContainerUpdate);
    this.subscribeWithFilter(MOUSE_WHEEL, this.handleWheelScroll);
    this.subscribeWithFilter(KEY_DOWN, this.handleKeyDown);
    this.subscribeWithFilter(KEY_UP, this.handleKeyUp);
    this.subscribeWithFilter(KEY_PRESS, this.handleKeyPress);
  }

  // Typescript will not allow `event` to be typed as `NormalizedEvent`,
  // which is a union type of all possible normalized events.  No idea why.

  private createEventFilterCallback(handler: (event: any) => void): (e: NormalizedEvent) => void {
    return (e: NormalizedEvent) => {
      const { mode } = this.store.getState().editor;

      if (rootEventFilter(e, mode)) {
        handler(e);
      }
    };
  }

  private subscribeWithFilter(event: EventType, handler: (event: any) => void): void {
    const { subscribe } = this.observer;

    subscribe(event, this.createEventFilterCallback(handler));
  }

  private handleLeftMouseClick = (event: NormalizedMouseClickEvent): void => {
    const { target } = event;
    const { type, id } = target;

    switch (type) {
      case DiagramMakerComponentsType.NODE:
        handleNodeClick(this.store, id);
        break;
      case (DiagramMakerComponentsType.EDGE_BADGE):
      case (DiagramMakerComponentsType.EDGE):
        handleEdgeClick(this.store, id);
        break;
      case (DiagramMakerComponentsType.WORKSPACE):
        handleWorkspaceClick(this.store);
        break;
    }
  }

  private getNormalizedPositionOffset = (
    position: Position,
    offset = { x: 0, y: 0 }
  ): Position => subtract(position, offset)

  private getNormalizedPositionOffsetInWorkspace = (
    position: Position,
    workspace: DiagramMakerWorkspace,
    offset = { x: 0, y: 0 }
  ): Position => {
    const targetPosition = this.getNormalizedPositionOffset(position, offset);
    return {
      x: (targetPosition.x - workspace.position.x) / workspace.scale,
      y: (targetPosition.y - workspace.position.y) / workspace.scale
    };
  }

  private handleDrag = (event: NormalizedDragEvent): void => {
    const { target, position, offset = { x: 0, y: 0 } } = event;
    const { type, id } = target;
    const editorMode = this.store.getState().editor.mode;
    const workspaceState = this.store.getState().workspace;

    switch (type) {
      case DiagramMakerComponentsType.PANEL_DRAG_HANDLE:
        if (id) {
          const normalizedPosition = this.getNormalizedPositionOffset(position, offset);
          const draggableElement = target.originalTarget as HTMLElement;
          handlePanelDrag(
            this.store,
            id,
            draggableElement,
            normalizedPosition,
            workspaceState.viewContainerSize
          );
        }
        break;
      case DiagramMakerComponentsType.NODE:
        handleNodeDrag(this.store, id, this.getNormalizedPositionOffsetInWorkspace(position, workspaceState, offset));
        break;
      case DiagramMakerComponentsType.WORKSPACE:
        switch (editorMode) {
          case EditorMode.SELECT:
            handleUpdateSelectionMarquee(
              this.store,
              this.getNormalizedPositionOffsetInWorkspace(position, workspaceState)
            );
            break;
          case EditorMode.DRAG:
          default:
            handleWorkspaceDrag(this.store, this.getNormalizedPositionOffset(position, offset));
            break;
        }
        break;
      case (DiagramMakerComponentsType.NODE_CONNECTOR):
        handleEdgeDrag(
          this.store,
          // No item offset, bc we want to draw dragged edges right at the tip of the pointer
          this.getNormalizedPositionOffsetInWorkspace(position, workspaceState)
        );
        break;
      case (DiagramMakerComponentsType.POTENTIAL_NODE):
        handlePotentialNodeDrag(
          this.store,
          this.getNormalizedPositionOffsetInWorkspace(position, workspaceState)
        );
        break;
    }
  }

  private handleDragStart = (event: NormalizedDragEvent): void => {
    const { target, position, offset = { x: 0, y: 0 } } = event;
    const { type, id } = target;
    const editorMode = this.store.getState().editor.mode;
    const workspaceState = this.store.getState().workspace;

    switch (type) {
      case DiagramMakerComponentsType.WORKSPACE:
        if (editorMode === EditorMode.SELECT) {
          handleShowSelectionMarquee(
            this.store,
            this.getNormalizedPositionOffsetInWorkspace(position, workspaceState)
          );
        }
        break;
      case DiagramMakerComponentsType.PANEL_DRAG_HANDLE:
        handlePanelDragStart(this.store, id);
        break;
      case DiagramMakerComponentsType.NODE:
        handleNodeDragStart(this.store, id);
        break;
      case (DiagramMakerComponentsType.NODE_CONNECTOR):
        handleEdgeDragStart(
          this.store,
          id,
          // No item offset, bc we want to draw dragged edges right at the tip of the pointer
          this.getNormalizedPositionOffsetInWorkspace(position, workspaceState)
        );
        break;
      case (DiagramMakerComponentsType.POTENTIAL_NODE):
        handlePotentialNodeDragStart(
          this.store,
          this.config,
          target,
          this.getNormalizedPositionOffsetInWorkspace(position, workspaceState)
        );
        break;
    }
  }

  private handleDragEnd = (event: NormalizedDragEvent): void => {
    const { target, position, offset = { x: 0, y: 0 } } = event;
    const { type, id } = target;
    const editorState = this.store.getState().editor;
    const editorMode = editorState && editorState.mode;

    switch (type) {
      case DiagramMakerComponentsType.WORKSPACE:
        if (editorMode === EditorMode.SELECT) {
          handleHideSelectionMarquee(this.store);
        }
        break;
      case DiagramMakerComponentsType.NODE:
        handleNodeDragEnd(this.store, id);
        break;
      case (DiagramMakerComponentsType.NODE_CONNECTOR):
        handleEdgeDragEnd(this.store, id);
        break;
      case (DiagramMakerComponentsType.POTENTIAL_NODE):
        handlePotentialNodeDragEnd(this.store, id);
        break;
    }
  }

  private handleWheelScroll = (event: NormalizedMouseScrollEvent): void => {
    const { delta, originalEvent, position } = event;

    const editorState = this.store.getState().editor;

    if (UITargetNormalizer.getTarget(originalEvent, DATA_ATTR_TYPE, DiagramMakerComponentsType.WORKSPACE)) {
      originalEvent.preventDefault();

      if (!editorState.contextMenu) {
        handleWorkspaceZoom(this.store, -delta, position);
      }
    }
  }

  private handleDragEnter = (event: NormalizedDropEvent): void => {
    const { target, dropzone, position, offset = { x: 0, y: 0 } } = event;

    // Handle drag enter
  }

  private handleDragLeave = (event: NormalizedDropEvent): void => {
    const { target, dropzone, position, offset = { x: 0, y: 0 } } = event;

    // Handle drag leave
  }

  private handleDragOver = (event: NormalizedDropEvent): void => {
    const { target, dropzone, position, offset = { x: 0, y: 0 } } = event;

    // Handle drag over
  }

  private handleDrop = (event: NormalizedDropEvent): void => {
    const { target, dropzone, position, offset = { x: 0, y: 0 } } = event;
    const { type, id } = target;

    switch (dropzone.type) {
      case (DiagramMakerComponentsType.NODE_CONNECTOR):
        if (type === DiagramMakerComponentsType.NODE_CONNECTOR) {
          handleEdgeCreate(this.store, id, dropzone.id);
        }
        break;
      case (DiagramMakerComponentsType.WORKSPACE):
        if (type === DiagramMakerComponentsType.POTENTIAL_NODE) {
          handleNodeCreate(this.store, id);
        }
    }

    // Handle drop
  }

  private handleWindowResize = (event: NormalizedWindowEvent): void => {
    const { size, originalEvent } = event;
    // Handle window resize
  }

  private handleContainerUpdate = (event: NormalizedContainerEvent): void => {
    const { contextRect } = event;

    const size = { height: contextRect.height, width: contextRect.width };

    // Handle container resize
    handleWorkspaceResize(this.store, size);
  }

  private handleRightMouseClick = (event: NormalizedMouseClickEvent): void => {
    const { target, button, position, offset, originalEvent } = event;

    handleShowContextMenu(this.store, this.config, event);
  }

  private handleMouseUp = (event: NormalizedMouseClickEvent): void => {
    const { target, button, position, offset, originalEvent } = event;

    // Handle mouse up
  }

  private handleMouseDown = (event: NormalizedMouseClickEvent): void => {
    const { target, button, position, offset, originalEvent } = event;

    handleHideContextMenu(this.store);
  }

  private handleMouseMove = (event: NormalizedMouseMoveEvent): void => {
    const { position, originalEvent } = event;

    // Handle mouse move
  }

  private handleKeyUp = (event: NormalizedKeyboardEvent): void => {
    const { originalEvent, code, key, modKey, shiftKey, metaKey, ctrlKey } = event;

  }

  // @NOTE Justification for using KeyDown as opposed to KeyUp or KeyPress for the Delete event:
  // 1) We cannot use KeyPress for the Delete key (or other non-printable keys).
  //    See: https://stackoverflow.com/questions/1116244/capturing-delete-keypress-with-jquery
  // 2) This leaves us with 2 options: KeyUp or KeyDown.  Other similar enterprise applications
  //    tend to use KeyDown instead of KeyUp for this type of event.
  //
  // The issue with using KeyDown is that it continues to fire if held.
  // This isn't an issue with delete, but it may cause an issue if
  // we were doing something like duplicating a node via keypress.

  private handleKeyDown = (event: NormalizedKeyboardEvent): void => {
    const { originalEvent, code, key, modKey, shiftKey, metaKey, ctrlKey } = event;

    switch (key) {
      case KeyboardKey.A:
        if (modKey) {
          handleSelectAll(this.store);
        }
        break;
      case KeyboardCode.DELETE:
        handleDeleteSelectedItems(this.store);
        break;
      case KeyboardCode.BACKSPACE:
        handleDeleteSelectedItems(this.store);
        break;
    }
  }

  private handleKeyPress = (event: NormalizedKeyboardEvent): void => {
    const { originalEvent, code, key, modKey, shiftKey, metaKey, ctrlKey } = event;

    // Handle key press
  }
}
