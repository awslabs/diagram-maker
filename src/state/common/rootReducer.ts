import { combineReducers, Reducer } from 'redux';
import { undoHistoryReducer } from 'redux-undo-redo';

import { DiagramMakerAction } from 'diagramMaker/state/actions';
import { edgeReducer, potentialEdgeReducer } from 'diagramMaker/state/edge';
import { editorReducer } from 'diagramMaker/state/editor';
import { nodeReducer, potentialNodeReducer } from 'diagramMaker/state/node';
import { panelReducer } from 'diagramMaker/state/panel';
import { pluginReducer } from 'diagramMaker/state/plugin';
import { DiagramMakerData } from 'diagramMaker/state/types';
import { workspaceReducer } from 'diagramMaker/state/workspace';

export function getRootReducer<NodeType, EdgeType>(
): Reducer<DiagramMakerData<NodeType, EdgeType>, DiagramMakerAction<NodeType, EdgeType>> {
  return combineReducers<DiagramMakerData<NodeType, EdgeType>, DiagramMakerAction<NodeType, EdgeType>>({
    edges: edgeReducer,
    editor: editorReducer,
    nodes: nodeReducer,
    panels: panelReducer,
    plugins: pluginReducer,
    potentialEdge: potentialEdgeReducer,
    potentialNode: potentialNodeReducer,
    undoHistory: undoHistoryReducer,
    workspace: workspaceReducer
  });
}
