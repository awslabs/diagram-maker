import * as Preact from 'preact';

import { ComposeView } from 'diagramMaker/components/common';
import {
  Connector, ConnectorProps, ConnectorType
} from 'diagramMaker/components/connector';
import {
  BoundRenderCallback, ConnectorPlacement, ConnectorPlacementType, DestroyCallback,
  TypeForVisibleConnectorTypes, VisibleConnectorTypes
} from 'diagramMaker/service/ConfigService';
import { DiagramMakerComponentsType } from 'diagramMaker/service/ui/types';
import { DiagramMakerNode } from 'diagramMaker/state/types';

import './Node.scss';

export interface NodeProps<NodeType> {
  connectorPlacement?: ConnectorPlacementType;
  renderCallback: BoundRenderCallback;
  destroyCallback: DestroyCallback;
  diagramMakerNode: DiagramMakerNode<NodeType>;
  visibleConnectorTypes?: TypeForVisibleConnectorTypes;
}

export default class Node<NodeType> extends Preact.Component<NodeProps<NodeType>, {}> {

  public render(): JSX.Element {
    const { diagramMakerData, id } = this.props.diagramMakerNode;
    const { x, y } = diagramMakerData.position;
    const { width, height } = diagramMakerData.size;
    const transform = `translate3d(${x}px, ${y}px, 0)`;
    const { renderCallback, destroyCallback } = this.props;

    return (
      <div
        className="dm-node"
        style={{ width, height, transform }}
        data-id={id}
        data-type={DiagramMakerComponentsType.NODE}
        data-event-target={true}
        data-draggable={true}
      >
        <ComposeView
          renderCallback={renderCallback}
          destroyCallback={destroyCallback}
        />
        {this.renderConnectors()}
      </div>
    );
  }

  public shouldComponentUpdate = (nextProps: NodeProps<NodeType>): boolean => {
    return nextProps.diagramMakerNode !== this.props.diagramMakerNode;
  }

  private getConnectors(): ConnectorProps[] {
    const { id, diagramMakerData } = this.props.diagramMakerNode;
    const { connectorPlacement } = this.props;
    const { width, height } = diagramMakerData.size;
    const horizontalCenter = width / 2;
    const verticalCenter = height / 2;
    const { INPUT, OUTPUT } = ConnectorType;

    switch (connectorPlacement) {
      case ConnectorPlacement.LEFT_RIGHT:
        return [
          { id, position: { x: 0, y: verticalCenter }, type: INPUT },
          { id, position: { x: width, y: verticalCenter }, type: OUTPUT }
        ];
      case ConnectorPlacement.TOP_BOTTOM:
        return [
          { id, position: { x: horizontalCenter, y: 0 }, type: INPUT },
          { id, position: { x: horizontalCenter, y: height }, type: OUTPUT }
        ];
      default:
        return [];
    }
  }

  private getFilteredConnectors(): ConnectorProps[] {
    const connectorProps = this.getConnectors();

    if (!this.props.visibleConnectorTypes) {
      return connectorProps;
    }

    const { INPUT, OUTPUT } = ConnectorType;
    switch (this.props.visibleConnectorTypes) {
      case VisibleConnectorTypes.INPUT_ONLY:
        return connectorProps.filter(connectorProp => connectorProp.type === INPUT);
      case VisibleConnectorTypes.OUTPUT_ONLY:
        return connectorProps.filter(connectorProp => connectorProp.type === OUTPUT);
      case VisibleConnectorTypes.NONE:
        return [];
    }
    return connectorProps;
  }

  private renderConnectors(): JSX.Element[] {
    return this.getFilteredConnectors().map((connector, i) => {
      const { id, type, position } = connector;
      return <Connector id={id} key={i} type={type} position={position} />;
    });
  }
}
