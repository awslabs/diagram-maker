import * as Dagre from 'dagre';
import { produce } from 'immer';
import cloneDeep from 'lodash-es/cloneDeep';
import keys from 'lodash-es/keys';
import values from 'lodash-es/values';

import { Size } from 'diagramMaker/state/types';
import { fromAdjacencyList } from 'diagramMaker/testing/diagramMakerDataBuilder';
import { asMock } from 'diagramMaker/testing/testUtils';

import { LayoutType, WorkflowLayoutConfig, WorkflowLayoutDirection } from './layoutActions';
import workflowLayout from './workflowLayout';

describe('workflowLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function getDagreGraphMock(): dagre.graphlib.Graph {
    // Mocked constructor always returns the same mock object.
    const dagreGraphMock = new Dagre.graphlib.Graph();

    // Reset mocks, so that call above does not count.
    jest.clearAllMocks();

    return dagreGraphMock;
  }

  it('converts data to Dagre graph', () => {
    const dagreGraphMock = getDagreGraphMock();

    const nodeSize: Size = { width: 23, height: 45 };

    /* tslint:disable:object-literal-sort-keys */
    const graph = fromAdjacencyList(
      {
        'node-start': ['node-a', 'node-b'],
        'node-a': ['node-a-1', 'node-a-2'],
        'node-a-1': ['node-start', 'node-a-2'],
        'node-a-2': ['node-b-1-1'],
        'node-b': ['node-b-1'],
        'node-b-1': ['node-b-1-1'],
        'node-b-1-1': []
      },
      nodeSize
    );
    /* tslint:enable */

    const layoutConfig: WorkflowLayoutConfig = {
      layoutType: LayoutType.WORKFLOW,
      direction: WorkflowLayoutDirection.LEFT_RIGHT,
      distanceMin: 123
    };

    let edgeLabelFn = null;
    asMock(dagreGraphMock.setDefaultEdgeLabel).mockImplementationOnce(fn => edgeLabelFn = fn);

    workflowLayout(graph, layoutConfig);

    expect(Dagre.graphlib.Graph).toBeCalledTimes(1);
    expect(dagreGraphMock.setGraph).toBeCalledTimes(1);
    expect(dagreGraphMock.setGraph).toBeCalledWith({
      nodesep: layoutConfig.distanceMin,
      rankdir: 'LR',
      ranksep: layoutConfig.distanceMin
    });

    // Edge label function should assign empty objects to all edges.
    // We don't use this functionality for our layouts.
    expect(dagreGraphMock.setDefaultEdgeLabel).toBeCalledTimes(1);
    expect(!!edgeLabelFn).toBe(true);
    expect((edgeLabelFn as any as (() => any)).apply(null)).toEqual({});

    keys(graph.nodes).forEach((nodeId) => {
      expect(dagreGraphMock.setNode).toBeCalledWith(nodeId, {
        height: nodeSize.height,
        width: nodeSize.width
      });
    });

    values(graph.edges).forEach((edge) => {
      expect(dagreGraphMock.setEdge).toBeCalledWith(edge.src, edge.dest);
    });
  });

  it('calls Dagre.layout(...) and updates node positions', () => {
    const dagreGraphMock = getDagreGraphMock();

    /* tslint:disable:object-literal-sort-keys */
    const graph = fromAdjacencyList({
      'node-a': ['node-b', 'node-c'],
      'node-b': ['node-c'],
      'node-c': []
    });
    /* tslint:enable */
    const graphOriginal = cloneDeep(graph);

    const layoutConfig: WorkflowLayoutConfig = {
      layoutType: LayoutType.WORKFLOW,
      direction: WorkflowLayoutDirection.TOP_BOTTOM,
      distanceMin: 50
    };

    asMock(dagreGraphMock.nodes).mockImplementationOnce(() => keys(graph.nodes));
    asMock(dagreGraphMock.node).mockImplementation((nodeId) => {
      switch (nodeId) {
        case 'node-a': return { x: 1, y: 10 };
        case 'node-b': return { x: 2, y: 20 };
        case 'node-c': return { x: 3, y: 30 };
        default: return { x: 10, y: 100 };
      }
    });

    const expectedOutput = produce(graph, (graphDraft) => {
      graphDraft.nodes['node-a'].diagramMakerData.position = { x: 1, y: 10 };
      graphDraft.nodes['node-b'].diagramMakerData.position = { x: 2, y: 20 };
      graphDraft.nodes['node-c'].diagramMakerData.position = { x: 3, y: 30 };
    });

    const output = workflowLayout(graph, layoutConfig);

    expect(Dagre.layout).toBeCalledTimes(1);
    expect(Dagre.layout).toBeCalledWith(dagreGraphMock);

    expect(output).toEqual(expectedOutput);

    // Verify purity: the graph that we pass into `workflowLayout` is not modified.
    expect(graph).toEqual(graphOriginal);

    asMock(dagreGraphMock.node).mockReset();
  });

  it('moves whole graph after layout to keep `fixedNodeId` in the same position', () => {
    const dagreGraphMock = getDagreGraphMock();

    /* tslint:disable:object-literal-sort-keys */
    let graph = fromAdjacencyList({
      'node-a': ['node-b', 'node-c'],
      'node-b': ['node-c'],
      'node-c': []
    });
    graph = produce(graph, (draft) => {
      draft.nodes['node-b'].diagramMakerData.position = { x: 500, y: 500 };
    });
    /* tslint:enable */

    const layoutConfig: WorkflowLayoutConfig = {
      layoutType: LayoutType.WORKFLOW,
      direction: WorkflowLayoutDirection.RIGHT_LEFT,
      distanceMin: 30,
      fixedNodeId: 'node-b'
    };

    asMock(dagreGraphMock.nodes).mockImplementationOnce(() => keys(graph.nodes));
    asMock(dagreGraphMock.node).mockImplementation((nodeId) => {
      switch (nodeId) {
        case 'node-a': return { x: 100, y: 10 };
        case 'node-b': return { x: 200, y: 10 };
        case 'node-c': return { x: 300, y: 10 };
        default: return { x: 0, y: 0 };
      }
    });

    const expectedOutput = produce(graph, (graphDraft) => {
      graphDraft.nodes['node-a'].diagramMakerData.position = { x: 400, y: 500 };
      graphDraft.nodes['node-b'].diagramMakerData.position = { x: 500, y: 500 }; // 'node-b' must stay
      graphDraft.nodes['node-c'].diagramMakerData.position = { x: 600, y: 500 };
    });

    const output = workflowLayout(graph, layoutConfig);

    expect(Dagre.layout).toBeCalledTimes(1);
    expect(Dagre.layout).toBeCalledWith(dagreGraphMock);

    expect(output).toEqual(expectedOutput);

    asMock(dagreGraphMock.node).mockReset();
  });
});
