import { DiagramMakerAction } from 'diagramMaker/state/actions';
import { DiagramMakerPlugins } from 'diagramMaker/state/types';

export default function pluginReducer<NodeType, EdgeType>(
    state: DiagramMakerPlugins | undefined, action: DiagramMakerAction<NodeType, EdgeType>
  ): DiagramMakerPlugins {
  if (state === undefined) {
    return {};
  }
  return state;
}
