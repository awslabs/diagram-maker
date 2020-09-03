import {
  DiagramMakerData, DiagramMakerEdge, DiagramMakerEditor, DiagramMakerNode, DiagramMakerWorkspace, EditorMode,
  Size
} from 'diagramMaker/state/types';

interface AdjacencyList {
  [key: string]: string[];
}

export function buildWorkspace(): DiagramMakerWorkspace {
  return {
    position: { x: 0, y: 0 },
    scale: 1.0,
    canvasSize: { width: 1600, height: 1600 },
    viewContainerSize: { width: 800, height: 800 }
  };
}

export function buildEditor(): DiagramMakerEditor {
  return {
    mode: EditorMode.SELECT
  };
}

export function fromAdjacencyList<NodeType = {}, EdgeType = {}>(
  adjacencyList: AdjacencyList,
  nodeSize?: Size
): DiagramMakerData<NodeType, EdgeType> {
  // Prepare nodes
  const nodes: { [key: string]: DiagramMakerNode<NodeType> } = {};
  Object.keys(adjacencyList).forEach((nodeId) => {
    nodes[nodeId] = {
      id: nodeId,
      diagramMakerData: {
        position: { x: 0, y: 0 },
        size: nodeSize || { width: 150, height: 50 }
      }
    };
  });

  // Prepare edges
  const edges: { [key: string]: DiagramMakerEdge<EdgeType> } = {};
  let edgeCount = 0;
  Object.keys(adjacencyList).forEach((sourceNodeId) => {
    adjacencyList[sourceNodeId].forEach((destinationNodeId) => {
      const edgeId = `edge-${edgeCount}`;
      edges[edgeId] = {
        id: edgeId,
        src: sourceNodeId,
        dest: destinationNodeId,
        diagramMakerData: {}
      };

      edgeCount += 1;
    });
  });

  return {
    nodes,
    edges,
    panels: {},
    workspace: buildWorkspace(),
    editor: buildEditor()
  };
}
