import { produce } from 'immer';

import { fromAdjacencyList } from 'diagramMaker/testing/diagramMakerDataBuilder';

import hierarchicalLayout from './hierarchicalLayout';
import { HierarchicalLayoutConfig, LayoutType } from './layoutActions';

// Note:
// All these tests compare snapshots of huge objects.
// You can't really tell if those huge objects are correct or not.
//
// If you find yourself fixing these tests / updating snapshots,
// please just pull the input data into your application, lay it out
// using the API call and see how it looks.
//
// That's the most reliable way to verify this functionality,
// as its purpose is visually appealing graph arrangements
// (not bunch of strict numbers to compare).

describe('hierarchicalLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not do anything to empty graph', () => {
    const graph = fromAdjacencyList({});
    const layoutConfig: HierarchicalLayoutConfig = {
      layoutType: LayoutType.HIERARCHICAL,
      fixedNodeIds: [],
      distanceMin: 50,
    };

    expect(hierarchicalLayout(graph, layoutConfig)).toEqual(graph);
  });

  it('does not do anything to single node graph', () => {
    let graph = fromAdjacencyList({ node: [] });
    graph = produce(graph, (draft) => {
      draft.nodes.node.diagramMakerData.position = { x: 123, y: 456 };
    });

    const layoutConfig: HierarchicalLayoutConfig = {
      layoutType: LayoutType.HIERARCHICAL,
      fixedNodeIds: ['node'],
      distanceMin: 50,
    };

    expect(hierarchicalLayout(graph, layoutConfig)).toEqual(graph);
  });

  it('does not do anything to completely disconnected nodes', () => {
    let graph = fromAdjacencyList({
      'node-1': [],
      'node-2': [],
    });
    graph = produce(graph, (draft) => {
      draft.nodes['node-1'].diagramMakerData.position = { x: 123, y: 456 };
      draft.nodes['node-2'].diagramMakerData.position = { x: 111, y: 222 };
    });

    const layoutConfig: HierarchicalLayoutConfig = {
      layoutType: LayoutType.HIERARCHICAL,
      fixedNodeIds: ['node-1'],
      distanceMin: 70,
    };

    expect(hierarchicalLayout(graph, layoutConfig)).toEqual(graph);
  });

  it('correctly lays out a tree with one fixed node', () => {
    let graph = fromAdjacencyList(
      {
        'node-start': ['node-a', 'node-b', 'node-c'],
        'node-a': ['node-a-1', 'node-a-2', 'node-a-3', 'node-a-4'],
        'node-a-1': [],
        'node-a-2': [],
        'node-a-3': [],
        'node-a-4': [],
        'node-b': ['node-b-1', 'node-b-2', 'node-b-3'],
        'node-b-1': [],
        'node-b-2': [],
        'node-b-3': [],
        'node-c': ['node-c-1', 'node-c-2'],
        'node-c-1': ['node-c-1-1'],
        'node-c-1-1': [],
        'node-c-2': [],
      },
      { width: 30, height: 30 },
    );
    graph = produce(graph, (draft) => {
      draft.nodes['node-start'].diagramMakerData.position = { x: 400, y: 400 };
    });
    const layoutConfig: HierarchicalLayoutConfig = {
      layoutType: LayoutType.HIERARCHICAL,
      fixedNodeIds: ['node-start'],
      distanceMin: 50,
      distanceMax: 250,
      distanceDeclineRate: 0.5,
    };

    expect(hierarchicalLayout(graph, layoutConfig)).toMatchSnapshot();
  });

  it('correctly lays out a tree with multiple fixed nodes', () => {
    let graph = fromAdjacencyList(
      {
        'node-start': ['node-a', 'node-b', 'node-c'],
        'node-a': ['node-a-1', 'node-a-2', 'node-a-3', 'node-a-4'],
        'node-a-1': [],
        'node-a-2': [],
        'node-a-3': [],
        'node-a-4': [],
        'node-b': ['node-b-1', 'node-b-2', 'node-b-3'],
        'node-b-1': [],
        'node-b-2': [],
        'node-b-3': [],
        'node-c': ['node-c-1', 'node-c-2'],
        'node-c-1': ['node-c-1-1'],
        'node-c-1-1': [],
        'node-c-2': [],
      },
      { width: 20, height: 20 },
    );
    graph = produce(graph, (draft) => {
      draft.nodes['node-a'].diagramMakerData.position = { x: 300, y: 400 };
      draft.nodes['node-b'].diagramMakerData.position = { x: 500, y: 400 };
      draft.nodes['node-c-1'].diagramMakerData.position = { x: 400, y: 100 };
    });
    const layoutConfig: HierarchicalLayoutConfig = {
      layoutType: LayoutType.HIERARCHICAL,
      fixedNodeIds: ['node-a', 'node-b', 'node-c-1'],
      distanceMin: 30,
    };

    expect(hierarchicalLayout(graph, layoutConfig)).toMatchSnapshot();
  });

  it('finds optimal arrangement of free nodes between fixed nodes', () => {
    let graph = fromAdjacencyList(
      {
        'fixed-node-1': ['node-center'],
        'fixed-node-2': ['node-center'],
        'fixed-node-3': ['node-center'],
        'node-center': ['node-1', 'node-2', 'node-3', 'node-4', 'node-5', 'node-6'],
        'node-1': [],
        'node-2': [],
        'node-3': [],
        'node-4': [],
        'node-5': [],
        'node-6': [],
      },
      { width: 40, height: 40 },
    );
    graph = produce(graph, (draft) => {
      draft.nodes['fixed-node-1'].diagramMakerData.position = { x: 300, y: 400 };
      draft.nodes['fixed-node-2'].diagramMakerData.position = { x: 500, y: 400 };
      draft.nodes['fixed-node-3'].diagramMakerData.position = { x: 500, y: 300 };
    });
    const layoutConfig: HierarchicalLayoutConfig = {
      layoutType: LayoutType.HIERARCHICAL,
      fixedNodeIds: ['fixed-node-1', 'fixed-node-2', 'fixed-node-3'],
      distanceMin: 40,
    };

    expect(hierarchicalLayout(graph, layoutConfig)).toMatchSnapshot();
  });

  it('uses `gravityAngle` even when `gravityStrength` is zero (odd number of nodes)', () => {
    let graph = fromAdjacencyList(
      {
        'node-start': ['node-a', 'node-b', 'node-c'],
        'node-a': [],
        'node-b': [],
        'node-c': [],
      },
      { width: 30, height: 30 },
    );
    graph = produce(graph, (draft) => {
      draft.nodes['node-start'].diagramMakerData.position = { x: 500, y: 500 };
    });
    const layoutConfig: HierarchicalLayoutConfig = {
      layoutType: LayoutType.HIERARCHICAL,
      fixedNodeIds: ['node-start'],
      distanceMin: 75,
      gravityAngle: Math.PI * 0.5,
      gravityStrength: 0.0,
    };

    expect(hierarchicalLayout(graph, layoutConfig)).toMatchSnapshot();
  });

  it('uses `gravityAngle` even when `gravityStrength` is zero (even number of nodes)', () => {
    let graph = fromAdjacencyList(
      {
        'node-start': ['node-a', 'node-b', 'node-c', 'node-d'],
        'node-a': [],
        'node-b': [],
        'node-c': [],
        'node-d': [],
      },
      { width: 30, height: 30 },
    );
    graph = produce(graph, (draft) => {
      draft.nodes['node-start'].diagramMakerData.position = { x: 500, y: 500 };
    });
    const layoutConfig: HierarchicalLayoutConfig = {
      layoutType: LayoutType.HIERARCHICAL,
      fixedNodeIds: ['node-start'],
      distanceMin: 45,
      gravityAngle: -Math.PI * 0.3,
      gravityStrength: 0.0,
    };

    expect(hierarchicalLayout(graph, layoutConfig)).toMatchSnapshot();
  });

  it('pushes nodes towards `gravityAngle` (single node)', () => {
    let graph = fromAdjacencyList(
      {
        'node-start': ['node-a'],
        'node-a': [],
      },
      { width: 30, height: 30 },
    );
    graph = produce(graph, (draft) => {
      draft.nodes['node-start'].diagramMakerData.position = { x: 450, y: 450 };
    });
    const layoutConfig: HierarchicalLayoutConfig = {
      layoutType: LayoutType.HIERARCHICAL,
      fixedNodeIds: ['node-start'],
      distanceMin: 60,
      gravityAngle: Math.PI,
      gravityStrength: 5.0,
    };

    expect(hierarchicalLayout(graph, layoutConfig)).toMatchSnapshot();
  });

  it('pushes nodes towards `gravityAngle` (odd number of nodes)', () => {
    let graph = fromAdjacencyList(
      {
        'node-start': ['node-a', 'node-b', 'node-c', 'node-d', 'node-e'],
        'node-a': [],
        'node-b': [],
        'node-c': [],
        'node-d': [],
        'node-e': [],
      },
      { width: 30, height: 30 },
    );
    graph = produce(graph, (draft) => {
      draft.nodes['node-start'].diagramMakerData.position = { x: 300, y: 450 };
    });
    const layoutConfig: HierarchicalLayoutConfig = {
      layoutType: LayoutType.HIERARCHICAL,
      fixedNodeIds: ['node-start'],
      distanceMin: 30,
      gravityAngle: Math.PI * 0.75,
      gravityStrength: 1.75,
    };

    expect(hierarchicalLayout(graph, layoutConfig)).toMatchSnapshot();
  });

  it('pushes nodes towards `gravityAngle` (even number of nodes)', () => {
    let graph = fromAdjacencyList(
      {
        'node-start': ['node-a', 'node-b', 'node-c', 'node-d'],
        'node-a': [],
        'node-b': [],
        'node-c': [],
        'node-d': [],
      },
      { width: 30, height: 30 },
    );
    graph = produce(graph, (draft) => {
      draft.nodes['node-start'].diagramMakerData.position = { x: 300, y: 450 };
    });
    const layoutConfig: HierarchicalLayoutConfig = {
      layoutType: LayoutType.HIERARCHICAL,
      fixedNodeIds: ['node-start'],
      distanceMin: 50,
      gravityAngle: Math.PI * 0.01,
      gravityStrength: 0.8,
    };

    expect(hierarchicalLayout(graph, layoutConfig)).toMatchSnapshot();
  });

  it('applies gravity away from the mean of fixed angles', () => {
    let graph = fromAdjacencyList(
      {
        'fixed-node-1': ['node-center'],
        'fixed-node-2': ['node-center'],
        'fixed-node-3': ['node-center'],
        'node-center': ['node-1', 'node-2', 'node-3', 'node-4', 'node-5', 'node-6'],
        'node-1': [],
        'node-2': [],
        'node-3': [],
        'node-4': [],
        'node-5': [],
        'node-6': [],
      },
      { width: 40, height: 40 },
    );
    graph = produce(graph, (draft) => {
      draft.nodes['fixed-node-1'].diagramMakerData.position = { x: 300, y: 400 };
      draft.nodes['fixed-node-2'].diagramMakerData.position = { x: 500, y: 400 };
      draft.nodes['fixed-node-3'].diagramMakerData.position = { x: 500, y: 300 };
    });
    const layoutConfig: HierarchicalLayoutConfig = {
      layoutType: LayoutType.HIERARCHICAL,
      fixedNodeIds: ['fixed-node-1', 'fixed-node-2', 'fixed-node-3'],
      distanceMin: 40,
      gravityAngle: 0.0,
      gravityStrength: 1.5,
    };

    expect(hierarchicalLayout(graph, layoutConfig)).toMatchSnapshot();
  });

  it('falls back to initial `gravityAngle` when mean is NaN', () => {
    let graph = fromAdjacencyList(
      {
        'fixed-node-1': ['node-center'],
        'fixed-node-2': ['node-center'],
        'node-center': ['node-1'],
        'node-1': [],
      },
      { width: 50, height: 50 },
    );
    graph = produce(graph, (draft) => {
      draft.nodes['fixed-node-1'].diagramMakerData.position = { x: 300, y: 400 };
      draft.nodes['fixed-node-2'].diagramMakerData.position = { x: 500, y: 400 };
    });
    const layoutConfig: HierarchicalLayoutConfig = {
      layoutType: LayoutType.HIERARCHICAL,
      fixedNodeIds: ['fixed-node-1', 'fixed-node-2'],
      distanceMin: 40,
      gravityAngle: Math.PI * 0.5,
      gravityStrength: 0.3,
    };

    expect(hierarchicalLayout(graph, layoutConfig)).toMatchSnapshot();
  });

  it('correctly propagates gravity throughout the graph', () => {
    let graph = fromAdjacencyList(
      {
        'node-start': ['node-a', 'node-b', 'node-c'],
        'node-a': ['node-a-1', 'node-a-2', 'node-a-3', 'node-a-4'],
        'node-a-1': [],
        'node-a-2': [],
        'node-a-3': [],
        'node-a-4': [],
        'node-b': ['node-b-1', 'node-b-2', 'node-b-3'],
        'node-b-1': [],
        'node-b-2': [],
        'node-b-3': [],
        'node-c': ['node-c-1', 'node-c-2'],
        'node-c-1': ['node-c-1-1'],
        'node-c-1-1': [],
        'node-c-2': [],
      },
      { width: 30, height: 30 },
    );
    graph = produce(graph, (draft) => {
      draft.nodes['node-start'].diagramMakerData.position = { x: 400, y: 400 };
    });
    const layoutConfig: HierarchicalLayoutConfig = {
      layoutType: LayoutType.HIERARCHICAL,
      fixedNodeIds: ['node-start'],
      distanceMin: 50,
      distanceMax: 250,
      distanceDeclineRate: 0.5,
      gravityAngle: Math.PI * 1.5,
      gravityStrength: 1.0,
    };

    expect(hierarchicalLayout(graph, layoutConfig)).toMatchSnapshot();
  });

  it('handles nodes with varying sizes', () => {
    let graph = fromAdjacencyList({
      'node-start': ['node-1'],
      'node-1': ['node-2'],
      'node-2': [],
    });
    graph = produce(graph, (draft) => {
      draft.nodes['node-start'].diagramMakerData.position = { x: 300, y: 300 };

      draft.nodes['node-start'].diagramMakerData.size = { width: 150, height: 10 };
      draft.nodes['node-1'].diagramMakerData.size = { width: 20, height: 80 };
      draft.nodes['node-2'].diagramMakerData.size = { width: 50, height: 50 };
    });
    const layoutConfig: HierarchicalLayoutConfig = {
      layoutType: LayoutType.HIERARCHICAL,
      fixedNodeIds: ['node-start'],
      distanceMin: 100,
      distanceMax: 100,
      gravityAngle: 0,
    };

    expect(hierarchicalLayout(graph, layoutConfig)).toMatchSnapshot();
  });
});
