import { DiagramMakerComponentsType } from 'diagramMaker/service/ui/types';

import {
  handlePanelDrag,
  handlePanelDragStart,
  handlePanelResize,
} from './panelActionDispatcher';
import { PanelActionsType } from './panelActions';

describe('panelActionDispatcher', () => {
  const viewContainerSize = { height: 800, width: 1200 };
  const canvasSize = { height: 100, width: 100 };

  const store: any = {
    dispatch: jest.fn(),
    getState: jest.fn(() => ({
      panels: {
        panel1: {
          size: {
            height: 100,
            width: 100,
          },
        },
      },
      workspace: {
        canvasSize,
        viewContainerSize,
      },
    })),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handlePanelDrag', () => {
    it('dispatches a panel drag action when id is present and panel is parent element', () => {
      const id = 'configuration';
      const dragHandlePosition = { x: 100, y: 200 };

      const dragHandleElement = document.createElement('div');
      const panelElement = document.createElement('div');

      panelElement.setAttribute('data-type', DiagramMakerComponentsType.PANEL);
      panelElement.appendChild(dragHandleElement);

      dragHandleElement.getBoundingClientRect = jest.fn(() => ({ top: 20, left: 20 })) as any;
      panelElement.getBoundingClientRect = jest.fn(() => ({ top: 10, left: 10 })) as any;

      handlePanelDrag(store, id, dragHandleElement, dragHandlePosition, viewContainerSize);

      const position = { x: 90, y: 190 };

      expect(store.dispatch).toHaveBeenCalledWith({
        payload: { position, id, viewContainerSize },
        type: PanelActionsType.PANEL_DRAG,
      });
    });

    it('dispatches a panel drag action when id is present and panel is grandparent element', () => {
      const id = 'configuration';
      const dragHandlePosition = { x: 100, y: 200 };

      const panelElement = document.createElement('div');
      panelElement.setAttribute('data-type', DiagramMakerComponentsType.PANEL);

      const contentElement = document.createElement('div');
      const dragHandleElement = document.createElement('div');

      contentElement.appendChild(dragHandleElement);
      panelElement.appendChild(contentElement);

      dragHandleElement.getBoundingClientRect = jest.fn(() => ({ top: 20, left: 20 })) as any;
      panelElement.getBoundingClientRect = jest.fn(() => ({ top: 10, left: 10 })) as any;

      handlePanelDrag(store, id, dragHandleElement, dragHandlePosition, viewContainerSize);

      const position = { x: 90, y: 190 };

      expect(store.dispatch).toHaveBeenCalledWith({
        payload: { position, id, viewContainerSize },
        type: PanelActionsType.PANEL_DRAG,
      });
    });

    it('dispatches a panel drag action when id is present and panel is not a parent element', () => {
      const id = 'configuration';
      const dragHandlePosition = { x: 100, y: 200 };

      const dragHandleElement = document.createElement('div');

      dragHandleElement.getBoundingClientRect = jest.fn(() => ({ top: 20, left: 20 })) as any;

      handlePanelDrag(store, id, dragHandleElement, dragHandlePosition, viewContainerSize);

      const position = { x: 100, y: 200 };

      expect(store.dispatch).toHaveBeenCalledWith({
        payload: { position, id, viewContainerSize },
        type: PanelActionsType.PANEL_DRAG,
      });
    });

    it('dispatches nothing when id is absent', () => {
      const id = undefined;
      const position = { x: 100, y: 200 };
      const dragHandleElement = document.createElement('div');

      handlePanelDrag(store, id, dragHandleElement, position, viewContainerSize);
      expect(store.dispatch).not.toHaveBeenCalled();
    });
  });

  describe('handlePanelDragStart', () => {
    it('dispatches an anchor panel drag start action when id is present', () => {
      const id = 'configuration';
      handlePanelDragStart(store, id);

      expect(store.dispatch).toHaveBeenCalledWith({
        payload: { id },
        type: PanelActionsType.PANEL_DRAG_START,
      });
    });

    it('dispatches nothing when id is absent', () => {
      const id = undefined;
      const position = { x: 100, y: 200 };
      const dragHandleElement = document.createElement('div');
      handlePanelDrag(store, id, dragHandleElement, position, viewContainerSize);
      expect(store.dispatch).not.toHaveBeenCalled();
    });
  });

  describe('handlePanelResize', () => {
    it('dispatches a panel resize action when id is present', () => {
      const panelId = 'panel1';
      const size = { height: 100, width: 200 };
      handlePanelResize(store, panelId, size);
      expect(store.dispatch).toHaveBeenCalledWith({
        payload: { size, id: panelId },
        type: PanelActionsType.PANEL_RESIZE,
      });
    });

    it('dispatches nothing when id is absent', () => {
      const panelId = undefined;
      const size = { height: 100, width: 200 };

      handlePanelResize(store, panelId, size);
      expect(store.dispatch).not.toHaveBeenCalled();
    });
  });
});
