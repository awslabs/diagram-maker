import { EdgeAction, EdgeActions, EdgeActionsType } from 'diagramMaker/state/edge/edgeActions';
import { EditorAction, EditorActions, EditorActionsType } from 'diagramMaker/state/editor/editorActions';
import { GlobalAction, GlobalActions, GlobalActionsType } from 'diagramMaker/state/global/globalActions';
import { LayoutAction, LayoutActions, LayoutActionsType } from 'diagramMaker/state/layout/layoutActions';
import { NodeAction, NodeActions, NodeActionsType } from 'diagramMaker/state/node/nodeActions';
import { PanelAction, PanelActions, PanelActionsType } from 'diagramMaker/state/panel/panelActions';
import { WorkspaceAction, WorkspaceActions, WorkspaceActionsType } from 'diagramMaker/state/workspace/workspaceActions';

export const DiagramMakerActions = {
  ...NodeActions,
  ...PanelActions,
  ...WorkspaceActions,
  ...EdgeActions,
  ...EditorActions,
  ...GlobalActions,
  ...LayoutActions
};

export type DiagramMakerAction<NodeType, EdgeType> = NodeAction<NodeType> | WorkspaceAction | PanelAction |
EdgeAction<EdgeType> | GlobalAction<NodeType, EdgeType>  | EditorAction | LayoutAction;
