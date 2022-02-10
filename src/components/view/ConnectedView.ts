import { connect } from 'react-redux';

import ConfigService from 'diagramMaker/service/ConfigService';
import { DiagramMakerData } from 'diagramMaker/state/types';

import { View } from './View';

export interface ConnectedViewOwnProps<NodeType, EdgeType> {
  configService: ConfigService<NodeType, EdgeType>;
}

function mapStateToProps<NodeType, EdgeType>(
  state: DiagramMakerData<NodeType, EdgeType>,
): { state: DiagramMakerData<NodeType, EdgeType> } {
  return { state };
}

export const getConnectedView = () => connect(mapStateToProps)(View);
