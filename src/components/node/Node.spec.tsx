import { Draft } from 'immer';
import * as Preact from 'preact';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

import { Node, NodeProps } from 'diagramMaker/components/node';
import { ConnectorPlacement, VisibleConnectorTypes } from 'diagramMaker/service/ConfigService';
import { DiagramMakerNode } from 'diagramMaker/state/types';

describe('Node', () => {
  const destroyCallback = jest.fn();
  const renderCallback = jest.fn((container: HTMLElement): HTMLElement => {
    const element = document.createElement('div');
    element.textContent = 'Example node content';
    container.appendChild(element);
    return element;
  });

  const getDiagramMakerNode = (): Draft<DiagramMakerNode<void>> => ({
    diagramMakerData: {
      position: {
        x: 400,
        y: 600,
      },
      size: {
        height: 300,
        width: 200,
      },
    },
    id: 'myNode',
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders at the given position and size', () => {
    const node = shallow(
      <Node
        diagramMakerNode={getDiagramMakerNode()}
        renderCallback={renderCallback}
        destroyCallback={destroyCallback}
      />,
    );

    expect(toJson(node)).toMatchSnapshot();
  });

  it('renders without any connectors', () => {
    const node = shallow(
      <Node
        diagramMakerNode={getDiagramMakerNode()}
        renderCallback={renderCallback}
        destroyCallback={destroyCallback}
      />,
    );

    expect(toJson(node)).toMatchSnapshot();
  });

  it('renders connectors on the top and bottom', () => {
    const node = shallow(
      <Node
        diagramMakerNode={getDiagramMakerNode()}
        renderCallback={renderCallback}
        connectorPlacement={ConnectorPlacement.TOP_BOTTOM}
        destroyCallback={destroyCallback}
      />,
    );

    expect(toJson(node)).toMatchSnapshot();
  });

  it('renders connectors on the left and right', () => {
    const node = shallow(
      <Node
        diagramMakerNode={getDiagramMakerNode()}
        renderCallback={renderCallback}
        connectorPlacement={ConnectorPlacement.LEFT_RIGHT}
        destroyCallback={destroyCallback}
      />,
    );

    expect(toJson(node)).toMatchSnapshot();
  });

  describe('visibleConnectorTypes', () => {
    it('renders connector only for output', () => {
      const diagramMakerNode = getDiagramMakerNode();
      const visibleConnectorTypes = VisibleConnectorTypes.OUTPUT_ONLY;
      const node = shallow(
        <Node
          diagramMakerNode={diagramMakerNode}
          renderCallback={renderCallback}
          connectorPlacement={ConnectorPlacement.LEFT_RIGHT}
          destroyCallback={destroyCallback}
          visibleConnectorTypes={visibleConnectorTypes}
        />,
      );

      expect(toJson(node)).toMatchSnapshot();
    });

    it('renders connector only for input', () => {
      const diagramMakerNode = getDiagramMakerNode();
      const visibleConnectorTypes = VisibleConnectorTypes.INPUT_ONLY;
      const node = shallow(
        <Node
          diagramMakerNode={diagramMakerNode}
          renderCallback={renderCallback}
          connectorPlacement={ConnectorPlacement.LEFT_RIGHT}
          destroyCallback={destroyCallback}
          visibleConnectorTypes={visibleConnectorTypes}
        />,
      );

      expect(toJson(node)).toMatchSnapshot();
    });

    it('renders no connectors', () => {
      const diagramMakerNode = getDiagramMakerNode();
      const visibleConnectorTypes = VisibleConnectorTypes.NONE;
      const node = shallow(
        <Node
          diagramMakerNode={diagramMakerNode}
          renderCallback={renderCallback}
          connectorPlacement={ConnectorPlacement.LEFT_RIGHT}
          destroyCallback={destroyCallback}
          visibleConnectorTypes={visibleConnectorTypes}
        />,
      );

      expect(toJson(node)).toMatchSnapshot();
    });

    it('renders input & output connectors', () => {
      const diagramMakerNode = getDiagramMakerNode();
      const visibleConnectorTypes = VisibleConnectorTypes.BOTH;
      const node = shallow(
        <Node
          diagramMakerNode={diagramMakerNode}
          renderCallback={renderCallback}
          connectorPlacement={ConnectorPlacement.LEFT_RIGHT}
          destroyCallback={destroyCallback}
          visibleConnectorTypes={visibleConnectorTypes}
        />,
      );

      expect(toJson(node)).toMatchSnapshot();
    });
  });

  describe('shouldComponentUpdate', () => {
    it('returns false if nextProps and the current props point to the same object', () => {
      const nodeData = getDiagramMakerNode();
      const node = mount<Node<{}>, NodeProps<{}>>(
        <Node
          diagramMakerNode={nodeData}
          renderCallback={renderCallback}
          destroyCallback={destroyCallback}
        />,
      );

      node.setProps({
        renderCallback,
        destroyCallback,
        diagramMakerNode: nodeData as DiagramMakerNode<{}>,
      });

      expect(renderCallback).toHaveBeenCalledTimes(1);
    });

    it('returns true if nextProps and the current props point to a different object', () => {
      const nodeData = getDiagramMakerNode();
      const node = mount<Node<{}>, NodeProps<{}>>(
        <Node
          diagramMakerNode={nodeData}
          renderCallback={renderCallback}
          destroyCallback={destroyCallback}
        />,
      );

      node.setProps({
        renderCallback,
        destroyCallback,
        diagramMakerNode: getDiagramMakerNode() as DiagramMakerNode<{}>,
      });

      expect(renderCallback).toHaveBeenCalledTimes(2);
    });
  });
});
