import { EditorMode, PositionAnchor } from 'diagramMaker/index';
import { DiagramMakerData } from 'diagramMaker/state/types';

export const graph: DiagramMakerData<{}, {}> = {
  nodes: {
    node1: {
      id: 'node1',
      diagramMakerData: {
        position: { x: 200, y: 150 },
        size: { width: 100, height: 50 }
      }
    },
    node2: {
      id: 'node2',
      diagramMakerData: {
        position: { x: 400, y: 300 },
        size: { width: 100, height: 50 }
      }
    }
  },
  edges: {
    edge1: {
      id: 'edge1',
      src: 'node1',
      dest: 'node2',
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
    [`plugin`]: {
      id: `plugin`,
      position: { x: 20, y: 20 },
      size: { width: 250, height: 400 },
      positionAnchor: PositionAnchor.TOP_LEFT
    }
  },
  plugins: {
    ['testPlugin']: {
      data: {
        size: { width: 200, height: 50 },
        workspacePos: { x: -100, y: -100 }
      }
    }
  },
  workspace: {
    position: { x: 0, y: 0 },
    scale: 1,
    canvasSize: { width: 3200, height: 1600 },
    viewContainerSize: { width: window.innerWidth, height: window.innerHeight }
  },
  editor: { mode: EditorMode.DRAG }
};
