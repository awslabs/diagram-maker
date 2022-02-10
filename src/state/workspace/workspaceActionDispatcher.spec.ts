import {
  createWorkspaceResetZoomAction,
  createZoomWorkspaceAction,
  handleSelectAll,
  handleWorkspaceClick,
  handleWorkspaceDrag,
  handleWorkspaceResize,
  handleWorkspaceZoom,
} from './workspaceActionDispatcher';
import { WorkspaceActionsType } from './workspaceActions';

describe('workspaceActionDispatcher', () => {
  const store: any = {
    dispatch: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleWorkspaceDrag', () => {
    it('dispatches a workspace drag action', () => {
      const x = 100;
      const y = 200;
      const position = { x, y };

      handleWorkspaceDrag(store, position);

      expect(store.dispatch).toHaveBeenCalledWith({
        payload: { position },
        type: WorkspaceActionsType.WORKSPACE_DRAG,
      });
    });
  });

  describe('handleWorkspaceZoom', () => {
    it('dispatches a workspace zoom action', () => {
      const zoom = 2;
      const position = {
        x: 100,
        y: 100,
      };

      handleWorkspaceZoom(store, zoom, position);

      expect(store.dispatch).toHaveBeenCalledWith({
        payload: { zoom, position },
        type: WorkspaceActionsType.WORKSPACE_ZOOM,
      });
    });
  });

  describe('handleWorkspaceClick', () => {
    it('dispatches a deselect action', () => {
      handleWorkspaceClick(store);

      expect(store.dispatch).toHaveBeenCalledWith({
        type: WorkspaceActionsType.WORKSPACE_DESELECT,
      });
    });
  });

  describe('handleWorkspaceResize', () => {
    it('dispatches a workspace resize action', () => {
      const containerSize = {
        height: 800,
        width: 1600,
      };

      handleWorkspaceResize(store, containerSize);

      expect(store.dispatch).toHaveBeenCalledWith({
        payload: { containerSize },
        type: WorkspaceActionsType.WORKSPACE_RESIZE,
      });
    });
  });

  describe('handleSelectAll', () => {
    it('dispatches a select all action', () => {
      handleSelectAll(store);

      expect(store.dispatch).toHaveBeenCalledWith({
        type: WorkspaceActionsType.WORKSPACE_SELECT_ALL,
      });
    });
  });

  describe('createZoomWorkspaceAction', () => {
    it('returns zoom workspace action', () => {
      const zoom = 5;
      const position = { x: 10, y: 10 };
      expect(createZoomWorkspaceAction(zoom, position)).toEqual({
        payload: {
          position, zoom,
        },
        type: WorkspaceActionsType.WORKSPACE_ZOOM,
      });
    });
  });

  describe('createWorkspaceResetZoomAction', () => {
    it('returns reset zoom workspace action', () => {
      expect(createWorkspaceResetZoomAction()).toEqual({
        type: WorkspaceActionsType.WORKSPACE_RESET_ZOOM,
      });
    });
  });
});
