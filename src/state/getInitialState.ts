import { DiagramMakerData, EditorMode } from 'diagramMaker/state/types';
import { getDefaultWorkspaceState } from 'diagramMaker/state/workspace';

export default function getInitialState<NodeType, EdgeType>(): DiagramMakerData<NodeType, EdgeType> {
  return {
    nodes: {},
    edges: {},
    panels: {},
    workspace: getDefaultWorkspaceState(),
    editor: {
      mode: EditorMode.DRAG
    }
  };
}
