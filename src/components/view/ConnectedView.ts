import * as Preact from 'preact';
import { connect } from 'preact-redux';

import ConfigService from 'diagramMaker/service/ConfigService';
import { DiagramMakerData } from 'diagramMaker/state/types';

import { View } from './View';

interface ConnectedViewStateProps<NodeType, EdgeType> {
  state: DiagramMakerData<NodeType, EdgeType>;
}

export interface ConnectedViewOwnProps<NodeType, EdgeType> {
  configService: ConfigService<NodeType, EdgeType>;
}

function mapStateToProps<NodeType, EdgeType>(
  state: DiagramMakerData<NodeType, EdgeType>
): { state: DiagramMakerData<NodeType, EdgeType> } {
  return { state };
}

// exporting a function instead of just a normal value lets us pass types to the ConnectedView component.

const getConnectedView =
  <NodeType, EdgeType>(): Preact.ComponentConstructor<ConnectedViewOwnProps<NodeType, EdgeType>> =>
  connect<ConnectedViewStateProps<NodeType, EdgeType>, {}, ConnectedViewOwnProps<NodeType, EdgeType>>(
    mapStateToProps
  )(View);

export {
  getConnectedView
};
