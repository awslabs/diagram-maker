import { EditorMode, PositionAnchor } from 'diagramMaker/index';
import { DiagramMakerData } from 'diagramMaker/state/types';

export const graph: DiagramMakerData<{}, {}> = {
  nodes: {
    node1: {
      id: 'node1',
      diagramMakerData: {
        position: { x: 0, y: 0 },
        size: { width: 300, height: 100 }
      }
    },
    node2: {
      id: 'node2',
      diagramMakerData: {
        position: { x: 0, y: 0 },
        size: { width: 300, height: 100 }
      }
    },
    node3: {
      id: 'node3',
      diagramMakerData: {
        position: { x: 0, y: 0 },
        size: { width: 300, height: 100 }
      }
    },
    node4: {
      id: 'node4',
      diagramMakerData: {
        position: { x: 0, y: 0 },
        size: { width: 300, height: 100 }
      }
    },
    node5: {
      id: 'node5',
      diagramMakerData: {
        position: { x: 0, y: 0 },
        size: { width: 300, height: 100 }
      }
    }
  },
  edges: {
    edge1: {
      id: 'edge1',
      src: 'node1',
      dest: 'node2',
      diagramMakerData: { }
    },
    edge2: {
      id: 'edge2',
      src: 'node2',
      dest: 'node3',
      diagramMakerData: { }
    },
    edge3: {
      id: 'edge3',
      src: 'node1',
      dest: 'node4',
      diagramMakerData: { }
    },
    edge4: {
      id: 'edge4',
      src: 'node1',
      dest: 'node5',
      diagramMakerData: { }
    }
  },
  panels: {
    [`library`]: {
      id: `library`,
      position: { x: 20, y: 20 },
      size: { width: 250, height: 600 },
      positionAnchor: PositionAnchor.TOP_RIGHT
    },
    [`tools`]: {
      id: `tools`,
      position: { x: 20, y: 20 },
      size: { width: 150, height: 400 }
    }
  },
  workspace: {
    position: { x: 0, y: 0 },
    scale: 1,
    canvasSize: { width: 1200, height: 900 },
    viewContainerSize: { width: window.innerWidth, height: window.innerHeight }
  },
  editor: { mode: EditorMode.DRAG }
};
