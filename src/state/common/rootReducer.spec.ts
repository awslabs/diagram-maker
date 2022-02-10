import { combineReducers } from 'redux';
import { undoHistoryReducer } from 'redux-undo-redo';

import { edgeReducer, potentialEdgeReducer } from 'diagramMaker/state/edge';
import { editorReducer } from 'diagramMaker/state/editor';
import { nodeReducer, potentialNodeReducer } from 'diagramMaker/state/node';
import { panelReducer } from 'diagramMaker/state/panel';
import { pluginReducer } from 'diagramMaker/state/plugin';
import { workspaceReducer } from 'diagramMaker/state/workspace';

import { getRootReducer } from './rootReducer';

jest.unmock('./rootReducer');

jest.mock('redux', () => ({
  combineReducers: jest.fn(),
}));

describe('getRootReducer', () => {
  it('calls combineReducers from redux', () => {
    getRootReducer();
    expect(combineReducers).toHaveBeenCalledWith({
      edges: edgeReducer,
      editor: editorReducer,
      nodes: nodeReducer,
      panels: panelReducer,
      plugins: pluginReducer,
      potentialEdge: potentialEdgeReducer,
      potentialNode: potentialNodeReducer,
      undoHistory: undoHistoryReducer,
      workspace: workspaceReducer,
    });
  });
});
