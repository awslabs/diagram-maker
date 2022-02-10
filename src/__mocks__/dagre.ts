const GraphMock = {
  edge: jest.fn(() => []),
  edges: jest.fn(() => []),
  node: jest.fn(() => []),
  nodes: jest.fn(() => []),
  setDefaultEdgeLabel: jest.fn(),
  setEdge: jest.fn(),
  setGraph: jest.fn(),
  setNode: jest.fn(),
};

export const graphlib = {
  Graph: jest.fn(() => GraphMock),
};

export const layout = jest.fn();
