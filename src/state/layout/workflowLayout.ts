import { produce } from 'immer';
import keys from 'lodash-es/keys';
import values from 'lodash-es/values';

import { DiagramMakerData, DiagramMakerNode, Position } from 'diagramMaker/state/types';

import { WorkflowLayoutConfig, WorkflowLayoutDirection } from './layoutActions';

/* tslint:disable:no-var-requires */
let Dagre: any;
try {
  Dagre = require('dagre');
} catch (e) {
  // Dagre is optional
}
/* tslint:enabled */

const WORKFLOW_DIRECTION_TO_DAGRE_MAP = {
  [WorkflowLayoutDirection.TOP_BOTTOM]: 'TB',
  [WorkflowLayoutDirection.BOTTOM_TOP]: 'BT',
  [WorkflowLayoutDirection.LEFT_RIGHT]: 'LR',
  [WorkflowLayoutDirection.RIGHT_LEFT]: 'RL'
};

export default function workflowLayout<NodeType, EdgeType>(
  state: DiagramMakerData<NodeType, EdgeType>,
  workflowConfig: WorkflowLayoutConfig
): DiagramMakerData<NodeType, EdgeType> {
  if (!Dagre) {
    throw new Error(
      'Could not find "dagre" library. It must be included in your application in order to use "Workflow" layout.'
    );
  }

  const dagreGraph = new Dagre.graphlib.Graph() as dagre.graphlib.Graph;
  dagreGraph.setGraph({
    rankdir: WORKFLOW_DIRECTION_TO_DAGRE_MAP[workflowConfig.direction],
    nodesep: workflowConfig.distanceMin,
    ranksep: workflowConfig.distanceMin
  });
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  keys(state.nodes).forEach((nodeId) => {
    const nodeData = state.nodes[nodeId].diagramMakerData;
    dagreGraph.setNode(nodeId, {
      height: nodeData.size.height,
      width: nodeData.size.width
    });
  });

  values(state.edges).forEach((edge) => {
    dagreGraph.setEdge(edge.src, edge.dest);
  });

  Dagre.layout(dagreGraph);

  // Dagre lays out graph neatly near the top-left corner.
  // Move whole graph so that `fixedNodeId` position will remain the same.
  // (That is, when `fixedNodeId` is provided.)
  let offset: Position = { x: 0, y: 0 };
  if (workflowConfig.fixedNodeId) {
    const initialFixedNodePosition = state.nodes[workflowConfig.fixedNodeId].diagramMakerData.position;
    const dagreFixedNode = dagreGraph.node(workflowConfig.fixedNodeId);
    offset = {
      x: initialFixedNodePosition.x - dagreFixedNode.x,
      y: initialFixedNodePosition.y - dagreFixedNode.y
    };
  }

  return produce(state, (draftState) => {
    dagreGraph.nodes().forEach((nodeId: any) => {
      const dagreNode = dagreGraph.node(nodeId);
      draftState.nodes[nodeId].diagramMakerData.position = {
        x: dagreNode.x + offset.x,
        y: dagreNode.y + offset.y
      };
    });
  });
}
