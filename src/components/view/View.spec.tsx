import merge from 'lodash-es/merge';
import * as Preact from 'preact';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

import ConfigService, {
  ConnectorPlacement, DiagramMakerConfig, Shape, VisibleConnectorTypes,
} from 'diagramMaker/service/ConfigService';
import { DiagramMakerComponentsType } from 'diagramMaker/service/ui/types';
import {
  DiagramMakerNodes, DiagramMakerWorkspace, EditorMode, Position,
} from 'diagramMaker/state/types';

import { View } from '.';

describe('View', () => {
  const edgeNode = jest.fn();
  const renderNode = jest.fn();
  const renderTestPanel = jest.fn();
  const destroy = jest.fn();

  const editorState = {
    mode: EditorMode.DRAG,
  };

  const workspaceState: DiagramMakerWorkspace = {
    position: {
      x: 0,
      y: 0,
    },
    scale: 1.2,
    canvasSize: {
      width: 10,
      height: 10,
    },
    viewContainerSize: {
      width: 5,
      height: 5,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const getConfigService = (overrideOptions: any = {}) => {
    const configOptions = merge(
      {
        renderCallbacks: {
          destroy,
          node: renderNode,
          panels: {
            test: renderTestPanel,
          },
        },
      },
      overrideOptions,
    );
    const config: DiagramMakerConfig<void, void> = configOptions;
    return new ConfigService(config);
  };

  const generateNode = (nodeKey: string, x = 0, y = 0, type?: string): DiagramMakerNodes<void> => ({
    [nodeKey]: {
      id: nodeKey,
      typeId: type,
      diagramMakerData: {
        position: { x, y },
        size: { width: 100, height: 100 },
      },
      consumerData: undefined,
    },
  });

  const generateEdge = (edgeKey: string, edgeSrc: string, edgeDest: string) => ({
    [edgeKey]: {
      dest: edgeDest,
      diagramMakerData: {},
      id: edgeKey,
      src: edgeSrc,
    },
  });

  const generateContextMenu = (
    targetType: DiagramMakerComponentsType,
    targetId?: string,
    position: Position = { x: 0, y: 0 },
  ) => ({
    position,
    targetId,
    targetType,
  });

  const generatePotentialEdge = (edgeSrc: string, x = 0, y = 0) => ({
    position: { x, y },
    src: edgeSrc,
  });

  const generatePotentialNode = (id: string, x = 0, y = 0, width = 150, height = 100) => ({
    position: { x, y },
    size: { height, width },
    typeId: id,
  });

  const generatePanel = (panelKey: string, x = 0, y = 0) => ({
    [panelKey]: {
      id: panelKey,
      position: {
        x,
        y,
      },
      size: {
        height: 300,
        width: 300,
      },
    },
  });

  describe('nodes with edge', () => {
    const mockNodes = { ...generateNode('node-1'), ...generateNode('node-2', 100, 200) };
    const mockEdges = { ...generateEdge('edge-1', 'node-1', 'node-2') };
    const mockState = {
      edges: mockEdges,
      editor: editorState,
      nodes: mockNodes,
      panels: {},
      workspace: workspaceState,
    };

    it('renders at the given position and size with nodes and a single edge with left/right connector', () => {
      const view = shallow(
        <View
          state={mockState}
          configService={getConfigService({ options: { connectorPlacement: ConnectorPlacement.LEFT_RIGHT } })}
        />,
      );
      expect(toJson(view)).toMatchSnapshot();
    });

    it('renders at the given position and size with nodes and a single edge with default connector', () => {
      const view = shallow(
        <View
          state={mockState}
          configService={getConfigService()}
        />,
      );
      expect(toJson(view)).toMatchSnapshot();
    });

    it('renders at the given position and size with nodes and a single edge with arrowhead', () => {
      const view = shallow(
        <View
          state={mockState}
          configService={getConfigService({ options: { showArrowhead: true } })}
        />,
      );
      expect(toJson(view)).toMatchSnapshot();
    });

    it('renders at the given position and size with nodes and a single edge with top/bottom connector', () => {
      const view = shallow(
        <View
          state={mockState}
          configService={getConfigService({ options: { connectorPlacement: ConnectorPlacement.TOP_BOTTOM } })}
        />,
      );
      expect(toJson(view)).toMatchSnapshot();
    });

    it('renders at the given position and size with nodes and a single edge with centered connector', () => {
      const view = shallow(
        <View
          state={mockState}
          configService={getConfigService({ options: { connectorPlacement: ConnectorPlacement.CENTERED } })}
        />,
      );
      expect(toJson(view)).toMatchSnapshot();
    });

    it('renders at the given position and size with nodes and a single edge with edge render callback', () => {
      const view = shallow(
        <View
          state={mockState}
          configService={getConfigService({ renderCallbacks: { edge: edgeNode } })}
        />,
      );
      expect(toJson(view)).toMatchSnapshot();
    });

    describe('nodes with types', () => {
      const type1 = 'type-1';
      const type2 = 'type-2';
      const getMockStateWithTypes = () => {
        const mockNodesWithTypes = {

          ...generateNode('node-1', 0, 0, type1),
          ...generateNode('node-2', 100, 200, type2),
        };
        return {
          edges: mockEdges,
          editor: { mode: EditorMode.DRAG },
          nodes: mockNodesWithTypes,
          panels: {},
          workspace: workspaceState,
        };
      };

      describe('with visible connector types config', () => {
        const configServiceWithShowConnectors = getConfigService({
          nodeTypeConfig: {
            [type1]: {
              visibleConnectorTypes: VisibleConnectorTypes.OUTPUT_ONLY,
            },
          },
        });
        it('renders the node passing the correct visible connector typess config', () => {
          const view = shallow(
            <View
              state={getMockStateWithTypes()}
              configService={configServiceWithShowConnectors}
            />,
          );
          expect(toJson(view)).toMatchSnapshot();
        });
      });

      describe('with connector placement override', () => {
        const configServiceWithConnectorPlacementOverride = getConfigService({
          nodeTypeConfig: {
            [type1]: {
              connectorPlacementOverride: ConnectorPlacement.TOP_BOTTOM,
            },
          },
        });
        it('renders the node passing the correct connector placement', () => {
          const view = shallow(
            <View
              state={getMockStateWithTypes()}
              configService={configServiceWithConnectorPlacementOverride}
            />,
          );
          expect(toJson(view)).toMatchSnapshot();
        });
      });

      describe('with shape & boundary defined', () => {
        const configServiceWithShapeAndBoundary = getConfigService({
          nodeTypeConfig: {
            [type1]: {
              shape: Shape.CIRCLE,
            },
            [type2]: {
              shape: Shape.RECTANGLE,
            },
          },
          options: { connectorPlacement: ConnectorPlacement.BOUNDARY },
        });
        it('renders the edge from the boundary of the node', () => {
          const view = shallow(
            <View
              state={getMockStateWithTypes()}
              configService={configServiceWithShapeAndBoundary}
            />,
          );
          expect(toJson(view)).toMatchSnapshot();
        });

        it('defaults to center based edges if circles overlap each other perfectly', () => {
          const mockNodesWithOverlappingCircles = {

            ...generateNode('node-1', 0, 0, type1),
            ...generateNode('node-2', 0, 0, type1),
          };
          const mockStateWithOverlappingCircles = {
            edges: mockEdges,
            editor: { mode: EditorMode.DRAG },
            nodes: mockNodesWithOverlappingCircles,
            panels: {},
            workspace: workspaceState,
          };
          const view = shallow(
            <View
              state={mockStateWithOverlappingCircles}
              configService={configServiceWithShapeAndBoundary}
            />,
          );
          expect(toJson(view)).toMatchSnapshot();
        });

        it('renders the edge on the top boundary of a rectangular node', () => {
          const mockNodesWithVerticalRectangles = {

            ...generateNode('node-1', 0, 0, type2),
            ...generateNode('node-2', 50, 200, type2),
          };
          const mockStateWithVerticalRectangles = {
            edges: mockEdges,
            editor: { mode: EditorMode.DRAG },
            nodes: mockNodesWithVerticalRectangles,
            panels: {},
            workspace: workspaceState,
          };
          const view = shallow(
            <View
              state={mockStateWithVerticalRectangles}
              configService={configServiceWithShapeAndBoundary}
            />,
          );
          expect(toJson(view)).toMatchSnapshot();
        });

        it('renders the edge on the side boundary of a rectangular node', () => {
          const mockNodesWithHorizontalRectangles = {

            ...generateNode('node-1', 0, 0, type2),
            ...generateNode('node-2', 200, 50, type2),
          };
          const mockStateWithHorizontalRectangles = {
            edges: mockEdges,
            editor: { mode: EditorMode.DRAG },
            nodes: mockNodesWithHorizontalRectangles,
            panels: {},
            workspace: workspaceState,
          };
          const view = shallow(
            <View
              state={mockStateWithHorizontalRectangles}
              configService={configServiceWithShapeAndBoundary}
            />,
          );
          expect(toJson(view)).toMatchSnapshot();
        });

        it('renders the edge on the boundary of a rectangular node when orthogonal', () => {
          const mockNodesWithOrthogonalRectangles = {

            ...generateNode('node-1', 0, 0, type2),
            ...generateNode('node-2', 0, 200, type2),
            ...generateNode('node-3', 0, 400, type2),
            ...generateNode('node-4', 200, 200, type2),
            ...generateNode('node-5', 200, 400, type2),
          };
          const mockOrthogonalEdges = {

            ...generateEdge('edge-1', 'node-1', 'node-2'), // vertical top
            ...generateEdge('edge-2', 'node-3', 'node-2'), // vertical bottom
            ...generateEdge('edge-3', 'node-4', 'node-2'), // horizontal right
            ...generateEdge('edge-4', 'node-3', 'node-5'), // horizontal left
          };
          const mockStateWithOrthogonalRectangles = {
            edges: mockOrthogonalEdges,
            editor: { mode: EditorMode.DRAG },
            nodes: mockNodesWithOrthogonalRectangles,
            panels: {},
            workspace: workspaceState,
          };
          const view = shallow(
            <View
              state={mockStateWithOrthogonalRectangles}
              configService={configServiceWithShapeAndBoundary}
            />,
          );
          expect(toJson(view)).toMatchSnapshot();
        });
      });
    });
  });

  describe('nodes with edge & a new edge drawing', () => {
    const mockNodes = { ...generateNode('node-1'), ...generateNode('node-2', 100, 200) };
    const mockEdges = { ...generateEdge('edge-1', 'node-1', 'node-2') };
    const mockPotentialEdge = { ...generatePotentialEdge('node-1') };
    const mockState = {
      edges: mockEdges,
      editor: editorState,
      nodes: mockNodes,
      panels: {},
      potentialEdge: mockPotentialEdge,
      workspace: workspaceState,
    };

    it('renders a new edge with left/right connector', () => {
      const view = shallow(
        <View
          state={mockState}
          configService={getConfigService({ options: { connectorPlacement: ConnectorPlacement.LEFT_RIGHT } })}
        />,
      );
      expect(toJson(view)).toMatchSnapshot();
    });

    it('renders a new edge with default connector', () => {
      const view = shallow(
        <View
          state={mockState}
          configService={getConfigService()}
        />,
      );
      expect(toJson(view)).toMatchSnapshot();
    });

    it('renders a new edge with top/bottom connector', () => {
      const view = shallow(
        <View
          state={mockState}
          configService={getConfigService({ options: { connectorPlacement: ConnectorPlacement.TOP_BOTTOM } })}
        />,
      );
      expect(toJson(view)).toMatchSnapshot();
    });

    it('renders a new edge with centered connector', () => {
      const view = shallow(
        <View
          state={mockState}
          configService={getConfigService({ options: { connectorPlacement: ConnectorPlacement.CENTERED } })}
        />,
      );
      expect(toJson(view)).toMatchSnapshot();
    });
  });

  describe('nodes with overlapping edges', () => {
    const mockNodes = { ...generateNode('node-1'), ...generateNode('node-2', 100, 200) };
    const mockEdges = {

      ...generateEdge('edge-1', 'node-1', 'node-2'),
      ...generateEdge('edge-2', 'node-2', 'node-1'),
    };
    const mockState = {
      edges: mockEdges,
      editor: editorState,
      nodes: mockNodes,
      panels: {},
      workspace: workspaceState,
    };

    it('renders two curved lines when an overlapping edge exists', () => {
      const view = shallow(
        <View
          state={mockState}
          configService={getConfigService({ renderCallbacks: { edge: edgeNode } })}
        />,
      );
      expect(toJson(view)).toMatchSnapshot();
    });
  });

  describe('nodes with edge & a new node dragging', () => {
    const mockNodes = { ...generateNode('node-1'), ...generateNode('node-2', 100, 200) };
    const mockEdges = { ...generateEdge('edge-1', 'node-1', 'node-2') };
    const mockPotentialNode = { ...generatePotentialNode('node-type-1') };
    const mockState = {
      edges: mockEdges,
      editor: editorState,
      nodes: mockNodes,
      panels: {},
      potentialNode: mockPotentialNode,
      workspace: workspaceState,
    };

    it('doesnt render potential node with no render callback', () => {
      const view = shallow(
        <View
          state={mockState}
          configService={getConfigService()}
        />,
      );
      expect(toJson(view)).toMatchSnapshot();
    });

    it('renders a potential node when render callback is provided', () => {
      const view = shallow(
        <View
          state={mockState}
          configService={getConfigService({ renderCallbacks: { potentialNode: jest.fn() } })}
        />,
      );
      expect(toJson(view)).toMatchSnapshot();
    });
  });

  describe('nodes with edge and context menu', () => {
    const mockNodes = { ...generateNode('node-1'), ...generateNode('node-2', 100, 200) };
    const mockEdges = { ...generateEdge('edge-1', 'node-1', 'node-2') };
    const mockContextMenu = { ...generateContextMenu(DiagramMakerComponentsType.NODE, 'node-1') };
    const mockState = {
      edges: mockEdges,
      editor: {
        contextMenu: mockContextMenu,
        mode: EditorMode.DRAG,
      },
      nodes: mockNodes,
      panels: {},
      workspace: workspaceState,
    };

    it('doesnt render if render context menu callbacks dont exist', () => {
      const view = shallow(
        <View
          state={mockState}
          configService={getConfigService({ options: { connectorPlacement: ConnectorPlacement.LEFT_RIGHT } })}
        />,
      );
      expect(toJson(view)).toMatchSnapshot();
    });

    it('renders context menu if render context menu callbacks do exist', () => {
      const view = shallow(
        <View
          state={mockState}
          configService={getConfigService({ renderCallbacks: { contextMenu: { node: jest.fn() } } })}
        />,
      );
      expect(toJson(view)).toMatchSnapshot();
    });
  });

  it('renders two panels without nodes or edges', () => {
    const mockPanels = { ...generatePanel('panel-1'), ...generatePanel('panel-2', 800, 200) };
    const panel1Callback = jest.fn(() => 'panel1Content') as any;
    const panel2Callback = jest.fn(() => 'panel2Content') as any;

    const config: DiagramMakerConfig<{}, {}> = {
      options: {
        connectorPlacement: ConnectorPlacement.LEFT_RIGHT,
      },
      renderCallbacks: {
        destroy,
        edge: edgeNode,
        node: renderNode,
        panels: {
          'panel-1': panel1Callback,
          'panel-2': panel2Callback,
        },
      },
    };
    const configService = new ConfigService(config);

    const mockState = {
      edges: {},
      editor: editorState,
      nodes: {},
      panels: mockPanels,
      workspace: workspaceState,
    };

    const view = shallow(
      (
        <View
          state={mockState}
          configService={configService}
        />
      ),
    );
    expect(toJson(view)).toMatchSnapshot();
  });

  it('renders two nodes without edges', () => {
    const mockNodes = { ...generateNode('node-1'), ...generateNode('node-2', 100, 200) };
    const mockState = {
      edges: {},
      editor: editorState,
      nodes: mockNodes,
      panels: {},
      workspace: workspaceState,
    };
    const view = shallow(
      <View
        state={mockState}
        configService={getConfigService()}
      />,
    );
    expect(toJson(view)).toMatchSnapshot();
  });

  it('does not render edge when accomplying node(s) do not exist', () => {
    const mockNodes = { ...generateNode('node-1'), ...generateNode('node-2', 100, 200) };
    // The nodes in the edge declaration are not valid
    const mockEdges = { ...generateEdge('edge-1', 'node-99', 'node-100') };

    const mockState = {
      edges: mockEdges,
      editor: editorState,
      nodes: mockNodes,
      panels: {},
      workspace: workspaceState,
    };
    const view = shallow(
      <View
        state={mockState}
        configService={getConfigService()}
      />,
    );
    expect(toJson(view)).toMatchSnapshot();
  });

  it('renders selection marquee', () => {
    const mockNodes = { ...generateNode('node-1'), ...generateNode('node-2', 100, 200) };
    const mockEditorState = {
      mode: EditorMode.SELECT,
      selectionMarquee: {
        anchor: { x: 500, y: 600 },
        position: { x: 510, y: 610 },
      },
    };

    const mockState = {
      edges: {},
      editor: mockEditorState,
      nodes: mockNodes,
      panels: {},
      workspace: workspaceState,
    };

    const view = shallow(
      <View
        state={mockState}
        configService={getConfigService()}
      />,
    );
    expect(toJson(view)).toMatchSnapshot();
  });
});
