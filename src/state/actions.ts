import { EdgeAction, EdgeActions } from 'diagramMaker/state/edge/edgeActions';
import { EditorAction, EditorActions } from 'diagramMaker/state/editor/editorActions';
import { GlobalAction, GlobalActions } from 'diagramMaker/state/global/globalActions';
import { LayoutAction, LayoutActions } from 'diagramMaker/state/layout/layoutActions';
import { NodeAction, NodeActions } from 'diagramMaker/state/node/nodeActions';
import { PanelAction, PanelActions } from 'diagramMaker/state/panel/panelActions';
import { WorkspaceAction, WorkspaceActions } from 'diagramMaker/state/workspace/workspaceActions';

export const DiagramMakerActions = {
  ...NodeActions,
  ...PanelActions,
  ...WorkspaceActions,
  ...EdgeActions,
  ...EditorActions,
  ...GlobalActions,
  ...LayoutActions,
};

export type DiagramMakerAction<NodeType, EdgeType> = NodeAction<NodeType> | WorkspaceAction | PanelAction |
EdgeAction<EdgeType> | GlobalAction<NodeType, EdgeType> | EditorAction | LayoutAction;
