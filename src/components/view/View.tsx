import * as Preact from 'preact';

import { ContextMenu } from 'diagramMaker/components/contextMenu';
import {
  Edge, EdgeBadge, EdgeStyle, PotentialEdge,
} from 'diagramMaker/components/edge';
import { Node, PotentialNode } from 'diagramMaker/components/node';
import { Panel } from 'diagramMaker/components/panel';
import { SelectionMarquee } from 'diagramMaker/components/selectionMarquee';
import { Workspace } from 'diagramMaker/components/workspace';
import ConfigService, {
  ConnectorPlacement, ConnectorPlacementType, CustomConnectorType, Shape, ShapeType, TypeForVisibleConnectorTypes,
} from 'diagramMaker/service/ConfigService';
import { getInflectionPoint } from 'diagramMaker/service/positionUtils';
import { DiagramMakerComponentsType } from 'diagramMaker/service/ui/types';
import {
  DiagramMakerData,
  DiagramMakerNode,
  Position,
  Size,
} from 'diagramMaker/state/types';

import './View.scss';

const CONNECTOR_PLACEMENT_TO_EDGE_TYPE = {
  [ConnectorPlacement.LEFT_RIGHT]: EdgeStyle.LEFT_RIGHT_BEZIER,
  [ConnectorPlacement.TOP_BOTTOM]: EdgeStyle.TOP_BOTTOM_BEZIER,
  [ConnectorPlacement.CENTERED]: EdgeStyle.STRAIGHT,
  [ConnectorPlacement.BOUNDARY]: EdgeStyle.STRAIGHT,
  [ConnectorPlacement.CUSTOM]: EdgeStyle.STRAIGHT,
};

interface EdgeCoordinatePair {
  src: Position;
  dest: Position;
}

export interface ViewProps<NodeType, EdgeType> {
  state: DiagramMakerData<NodeType, EdgeType>;
  configService: ConfigService<NodeType, EdgeType>;
}

const getConnectorPlacementForNode = <NodeType, EdgeType>(
  node: DiagramMakerNode<NodeType>,
  configService: ConfigService<NodeType, EdgeType>,
) => {
  const { typeId } = node;
  if (!typeId) {
    return configService.getConnectorPlacement();
  }

  return configService.getConnectorPlacementForNodeType(typeId);
};

const getCustomConnectorsForNode = <NodeType, EdgeType>(
  node: DiagramMakerNode<NodeType>,
  configService: ConfigService<NodeType, EdgeType>,
): { [connectorId: string]: CustomConnectorType } => {
  const { typeId } = node;
  if (!typeId) {
    return {};
  }

  return configService.getCustomConnectorTypesForNodeType(typeId);
};

const getCenteredConnectorCoordinates = <NodeType extends any>(node: DiagramMakerNode<NodeType>): Position => {
  const { position, size } = node.diagramMakerData;
  return {
    x: position.x + size.width / 2,
    y: position.y + size.height / 2,
  };
};

const getCustomConnectorCoordinates = <NodeType, EdgeType>(
  node: DiagramMakerNode<NodeType>,
  configService: ConfigService<NodeType, EdgeType>,
  connectorType: string,
): Position => {
  const connectors = getCustomConnectorsForNode(node, configService);
  const connector = connectors[connectorType];
  if (connector && connector.position) {
    const nodePosition = node.diagramMakerData.position;
    return {
      x: nodePosition.x + connector.position.x,
      y: nodePosition.y + connector.position.y,
    };
  }
  return getCenteredConnectorCoordinates(node);
};

const getLeftRightConnectorCoordinatesSource = <NodeType extends any>(node: DiagramMakerNode<NodeType>): Position => {
  const { position, size } = node.diagramMakerData;
  return {
    x: position.x + size.width,
    y: position.y + size.height / 2,
  };
};

const getLeftRightConnectorCoordinatesDest = <NodeType extends any>(node: DiagramMakerNode<NodeType>): Position => {
  const { position, size } = node.diagramMakerData;
  return {
    x: position.x,
    y: position.y + size.height / 2,
  };
};

const getTopBottomConnectorCoordinatesDest = <NodeType extends any>(node: DiagramMakerNode<NodeType>): Position => {
  const { position, size } = node.diagramMakerData;
  return {
    x: position.x + size.width / 2,
    y: position.y,
  };
};

const getTopBottomConnectorCoordinatesSource = <NodeType extends any>(node: DiagramMakerNode<NodeType>): Position => {
  const { position, size } = node.diagramMakerData;
  return {
    x: position.x + size.width / 2,
    y: position.y + size.height,
  };
};

const getEdgeCoordinateSource = <NodeType, EdgeType>(
  node: DiagramMakerNode<NodeType>,
  configService: ConfigService<NodeType, EdgeType>,
  connectorSrcType?: string,
): Position => {
  let sourceCoordinates: Position;
  const connectorPlacement = getConnectorPlacementForNode(node, configService);
  if (connectorPlacement === ConnectorPlacement.LEFT_RIGHT) {
    sourceCoordinates = getLeftRightConnectorCoordinatesSource(node);
  } else if (connectorPlacement === ConnectorPlacement.TOP_BOTTOM) {
    sourceCoordinates = getTopBottomConnectorCoordinatesSource(node);
  } else if (connectorPlacement === ConnectorPlacementType.CUSTOM) {
    if (connectorSrcType) {
      sourceCoordinates = getCustomConnectorCoordinates(node, configService, connectorSrcType);
    } else {
      return getCenteredConnectorCoordinates(node);
    }
  } else {
    sourceCoordinates = getCenteredConnectorCoordinates(node);
  }
  return sourceCoordinates;
};

const getEdgeCoordinateDestination = <NodeType, EdgeType>(
  node: DiagramMakerNode<NodeType>,
  configService: ConfigService<NodeType, EdgeType>,
  connectorDestType?: string,
): Position => {
  let sourceCoordinates: Position;
  const connectorPlacement = getConnectorPlacementForNode(node, configService);
  if (connectorPlacement === ConnectorPlacement.LEFT_RIGHT) {
    sourceCoordinates = getLeftRightConnectorCoordinatesDest(node);
  } else if (connectorPlacement === ConnectorPlacement.TOP_BOTTOM) {
    sourceCoordinates = getTopBottomConnectorCoordinatesDest(node);
  } else if (connectorPlacement === ConnectorPlacementType.CUSTOM) {
    if (connectorDestType) {
      sourceCoordinates = getCustomConnectorCoordinates(node, configService, connectorDestType);
    } else {
      return getCenteredConnectorCoordinates(node);
    }
  } else {
    sourceCoordinates = getCenteredConnectorCoordinates(node);
  }
  return sourceCoordinates;
};

const getDistance = (srcPosition: Position, destPosition: Position) => {
  const diffX = destPosition.x - srcPosition.x;
  const diffY = destPosition.y - srcPosition.y;
  return Math.sqrt((diffX * diffX) + (diffY * diffY));
};

const getBoundaryCoordinatesForCircle = (
  sourcePosition: Position,
  sourceSize: Size,
  destinationPosition: Position,
): Position => {
  const distance = getDistance(sourcePosition, destinationPosition);
  if (distance === 0) {
    return sourcePosition;
  }
  // Using this formula to compute the coordinates: https://brilliant.org/wiki/section-formula/
  const { x: x1, y: y1 } = sourcePosition;
  const { x: x2, y: y2 } = destinationPosition;
  const m = sourceSize.width / 2;
  const n = distance - m;
  return {
    x: ((m * x2) + (n * x1)) / distance,
    y: ((m * y2) + (n * y1)) / distance,
  };
};

const getBoundaryCoordinatesForRectangle = (
  sourcePosition: Position,
  sourceSize: Size,
  destinationPosition: Position,
): Position => {
  // If the two points are orthogonal, the boundary is half the width or height of the rectangle.
  if (sourcePosition.x === destinationPosition.x) {
    return {
      x: sourcePosition.x,
      y: destinationPosition.y > sourcePosition.y
        ? sourcePosition.y + sourceSize.height / 2
        : sourcePosition.y - sourceSize.height / 2,
    };
  }
  if (sourcePosition.y === destinationPosition.y) {
    return {
      x: destinationPosition.x > sourcePosition.x
        ? sourcePosition.x + sourceSize.width / 2
        : sourcePosition.x - sourceSize.width / 2,
      y: sourcePosition.y,
    };
  }

  // Otherwise - locate the boundary intersection point by calculating two right angle triangles.
  // The first, bigger one, is created between the source and destination points.
  // The second, smaller one, is created between the destination center and boundary intersection,
  // with the rectangle. Use Pythagorus theorem for the calculations.
  const adjacentSideBig = Math.abs(sourcePosition.x - destinationPosition.x);
  const oppositeSideBig = Math.abs(sourcePosition.y - destinationPosition.y);
  const angleT = Math.atan(oppositeSideBig / adjacentSideBig);

  // Now we calculate the smaller triangle, inside the rectangle.
  let adjacentSide;
  let oppositeSide;
  const diagonalAngle = Math.atan((sourceSize.width / 2) / sourceSize.height / 2);
  if (angleT > diagonalAngle) {
    // Intersection is on the top or bottom side
    oppositeSide = sourceSize.height / 2;
    adjacentSide = Math.abs(oppositeSide / Math.tan(angleT));
  } else {
    // Intersection is on the left or right side
    adjacentSide = sourceSize.width / 2;
    oppositeSide = Math.abs(adjacentSide * Math.tan(angleT));
  }
  let distanceX = adjacentSide;
  let distanceY = oppositeSide;

  // Calculate directions
  if (destinationPosition.x < sourcePosition.x) {
    distanceX *= -1;
  }
  if (destinationPosition.y < sourcePosition.y) {
    distanceY *= -1;
  }

  return {
    x: sourcePosition.x + distanceX,
    y: sourcePosition.y + distanceY,
  };
};

const getBoundaryCoordinates = (
  sourcePosition: Position,
  sourceShape: ShapeType | undefined,
  sourceSize: Size,
  destPosition: Position,
): Position => {
  switch (sourceShape) {
    case Shape.CIRCLE:
      return getBoundaryCoordinatesForCircle(sourcePosition, sourceSize, destPosition);
    case Shape.RECTANGLE:
      return getBoundaryCoordinatesForRectangle(sourcePosition, sourceSize, destPosition);
    default:
      return sourcePosition;
  }
};

const applyBoundaryCheck = <NodeType, EdgeType>(
  configService: ConfigService<NodeType, EdgeType>,
  nodeSrc: DiagramMakerNode<NodeType>,
  positionSrc: Position,
  positionDest: Position,
) => {
  const sourceConnectorPlacement = getConnectorPlacementForNode(nodeSrc, configService);
  let sourceShape: ShapeType | undefined;
  if (nodeSrc.typeId) {
    sourceShape = configService.getShapeForNodeType(nodeSrc.typeId);
  }
  if (sourceConnectorPlacement === ConnectorPlacement.BOUNDARY) {
    return getBoundaryCoordinates(
      positionSrc,
      sourceShape,
      nodeSrc.diagramMakerData.size,
      positionDest,
    );
  }

  return positionSrc;
};

const getEdgeCoordinatePair = <NodeType, EdgeType>(
  nodeSrc: DiagramMakerNode<NodeType>,
  nodeDest: DiagramMakerNode<NodeType>,
  configService: ConfigService<NodeType, EdgeType>,
  overlappingEdge?: boolean,
  connectorSrcType?: string,
  connectorDestType?: string,
): EdgeCoordinatePair => {
  const coordinates: EdgeCoordinatePair = {
    src: getEdgeCoordinateSource(nodeSrc, configService, connectorSrcType),
    dest: getEdgeCoordinateDestination(nodeDest, configService, connectorDestType),
  };
  let tempDest = coordinates.dest;
  let tempSrc = coordinates.src;

  /**
   * To find the point to cut based on overlapping edges
   * We estimate the x/y coordinates of dest & src by creating a bezier curve
   * https://stackoverflow.com/questions/51811935/point-of-intersection-between-bezier-curve-and-circle
   */
  if (overlappingEdge) {
    const { x: startingX, y: startingY } = getInflectionPoint(tempSrc, tempDest);
    tempDest = { x: startingX, y: startingY };
    tempSrc = { x: startingX, y: startingY };
  }

  const newSrc = applyBoundaryCheck(configService, nodeSrc, coordinates.src, tempDest);
  const newDest = applyBoundaryCheck(configService, nodeDest, coordinates.dest, tempSrc);

  return {
    src: newSrc,
    dest: newDest,
  };
};

const getEdgeStyle = (
  sourceConnectorPlacement: ConnectorPlacementType,
  destinationConnectorPlacement: ConnectorPlacementType,
): EdgeStyle => {
  if (sourceConnectorPlacement === destinationConnectorPlacement) {
    return CONNECTOR_PLACEMENT_TO_EDGE_TYPE[sourceConnectorPlacement];
  }
  return EdgeStyle.STRAIGHT;
};

class View<NodeType, EdgeType> extends Preact.Component<ViewProps<NodeType, EdgeType>> {
  public render() {
    const {
      position: workspacePosition,
      canvasSize: workspaceSize,
      scale: workspaceScale,
    } = this.props.state.workspace;

    /**
     * We need to put interim on top of the panels so that we can make the potential nodes appear on top of the panels.
     * This is because workspace has a stacking context of its own and we cannot make the node appear on top of the
     * panel from within the workspace.
     * To make it so that when the node comes out of the panel, it appears the same size as it would in the workspace,
     * we need to apply the same transforms on the interim as well.
     */
    const transform = `translate3d(${workspacePosition.x}px, ${workspacePosition.y}px, 0) scale(${workspaceScale})`;

    return (
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      <div className="dm-view" tabIndex={0} data-type={DiagramMakerComponentsType.VIEW}>
        <Workspace
          position={workspacePosition}
          canvasSize={workspaceSize}
          scale={workspaceScale}
        >
          <div className="dm-elements">
            <svg className="dm-edges" xmlns="http://www.w3.org/2000/svg">
              {this.renderArrowheadMarker()}
              {this.renderEdges()}
            </svg>
            {this.renderEdgeBadges()}
            {this.renderNodes()}
            <svg className="dm-potential-edge" xmlns="http://www.w3.org/2000/svg">
              {this.renderPotentialEdge()}
            </svg>
          </div>
        </Workspace>
        <div className="dm-panels">
          {this.renderPanels()}
        </div>
        <div
          className="dm-interim"
          style={{ transform }}
        >
          {this.renderPotentialNode()}
        </div>
        <div
          className="dm-selection"
          style={{ transform }}
        >
          {this.renderSelectionMarquee()}
        </div>
        <div className="dm-menu">
          {this.renderContextMenu()}
        </div>
      </div>
    );
  }

  private renderArrowheadMarker() {
    if (!this.props.configService.getShowArrowhead()) {
      return undefined;
    }

    return (
      <defs>
        <marker
          id="arrow"
          markerWidth="5"
          markerHeight="5"
          orient="auto"
          refY="2.5"
          refX="5"
          stroke="#879596"
          fill="#879596"
        >
          <path d="M0,0 L5,2.5 0,5" />
        </marker>
      </defs>
    );
  }

  private renderNodes() {
    const { nodes } = this.props.state;
    const renderCallback = this.props.configService.getRenderNode();
    const destroyCallback = this.props.configService.getRenderDestroy();
    const nodeKeys = Object.keys(nodes);
    return nodeKeys.map((nodeKey: string) => {
      const { typeId } = nodes[nodeKey];
      const connectorPlacement = getConnectorPlacementForNode(nodes[nodeKey], this.props.configService);
      let visibleConnectorTypes: TypeForVisibleConnectorTypes | undefined;
      if (typeId) {
        visibleConnectorTypes = this.props.configService.getVisibleConnectorTypesForNodeType(typeId);
      }

      return (
        <Node
          key={`node_${nodes[nodeKey].id}`}
          renderCallback={renderCallback.bind(null, nodes[nodeKey])}
          destroyCallback={destroyCallback}
          connectorPlacement={connectorPlacement}
          diagramMakerNode={nodes[nodeKey]}
          visibleConnectorTypes={visibleConnectorTypes}
        />
      );
    });
  }

  private renderPotentialNode() {
    const node = this.props.state.potentialNode;
    const renderCallback = this.props.configService.getRenderPotentialNode();
    const destroyCallback = this.props.configService.getRenderDestroy();

    if (!node || !renderCallback) {
      return undefined;
    }

    const { typeId, position, size } = node;

    return (
      <PotentialNode
        key="potentialNode"
        typeId={typeId}
        position={position}
        size={size}
        renderCallback={renderCallback.bind(null, node)}
        destroyCallback={destroyCallback}
      />
    );
  }

  private renderEdges() {
    const { singles: edgeSingles, pairs: edgePairs } = this.getEdges();
    let pairEdges: JSX.Element[] = [];

    edgePairs.forEach((edgePair: string[]) => {
      pairEdges = pairEdges.concat(edgePair.map((edgeKey) => this.renderEdge(edgeKey, true)));
    });

    const singleEdges = edgeSingles.map((edgeKey) => this.renderEdge(edgeKey));

    return singleEdges.concat(pairEdges);
  }

  private renderEdge(edgeKey: string, isEdgePair?: boolean) {
    const { nodes } = this.props.state;
    const { edges } = this.props.state;
    const edgeSource = nodes[edges[edgeKey].src];
    const edgeDestination = nodes[edges[edgeKey].dest];
    const edgeCoordinates = getEdgeCoordinatePair(
      edgeSource,
      edgeDestination,
      this.props.configService,
      isEdgePair,
      edges[edgeKey]?.connectorSrcType,
      edges[edgeKey]?.connectorDestType,
    );

    const edgeStyle = isEdgePair ? EdgeStyle.QUADRATIC_BEZIER : getEdgeStyle(
      getConnectorPlacementForNode(edgeSource, this.props.configService),
      getConnectorPlacementForNode(edgeDestination, this.props.configService),
    );

    return (
      <Edge
        key={`edge_${edges[edgeKey].id}`}
        id={edges[edgeKey].id}
        src={edgeCoordinates.src}
        dest={edgeCoordinates.dest}
        srcTypeId={edgeSource.typeId}
        destTypeId={edgeDestination.typeId}
        edgeStyle={edgeStyle}
        selected={edges[edgeKey].diagramMakerData.selected}
        showArrowhead={this.props.configService.getShowArrowhead()}
      />
    );
  }

  private renderEdgeBadges() {
    const { nodes } = this.props.state;
    const { edges } = this.props.state;
    const renderCallback = this.props.configService.getRenderEdge();
    const destroyCallback = this.props.configService.getRenderDestroy();

    if (!renderCallback) {
      return undefined;
    }

    const { singles: edgeSingles, pairs: edgePairs } = this.getEdges();
    let pairEdges: JSX.Element[] = [];
    edgePairs.forEach((edgePair: string[]) => {
      pairEdges = pairEdges.concat(edgePair.map((edgeKey: string) => {
        const edgeCoordinates = getEdgeCoordinatePair(
          nodes[edges[edgeKey].src],
          nodes[edges[edgeKey].dest],
          this.props.configService,
          true,
          edges[edgeKey]?.connectorSrcType,
          edges[edgeKey]?.connectorDestType,
        );

        return (
          <EdgeBadge
            id={edgeKey}
            key={`edgeBadge_${edges[edgeKey].id}`}
            src={edgeCoordinates.src}
            dest={edgeCoordinates.dest}
            renderCallback={renderCallback.bind(null, edges[edgeKey])}
            destroyCallback={destroyCallback}
            isPartOfEdgePair
          />
        );
      }));
    });

    const singleEdges = edgeSingles
      .map((edgeKey: string) => {
        const edgeCoordinates = getEdgeCoordinatePair(
          nodes[edges[edgeKey].src],
          nodes[edges[edgeKey].dest],
          this.props.configService,
          false,
          edges[edgeKey].connectorSrcType,
          edges[edgeKey].connectorDestType,
        );

        return (
          <EdgeBadge
            id={edgeKey}
            key={`edgeBadge_${edges[edgeKey].id}`}
            src={edgeCoordinates.src}
            dest={edgeCoordinates.dest}
            renderCallback={renderCallback.bind(null, edges[edgeKey])}
            destroyCallback={destroyCallback}
          />
        );
      });

    return singleEdges.concat(pairEdges);
  }

  private getEdges(): { singles: string[], pairs: string[][] } {
    const { nodes } = this.props.state;
    const { edges } = this.props.state;
    const edgeKeys = Object.keys(edges);
    const activeEdges = edgeKeys.filter(
      (edgeKey: string) => !!(nodes[edges[edgeKey].src] && nodes[edges[edgeKey].dest]),
    );
    const connectorPlacement = this.props.configService.getConnectorPlacement();
    const edgeMapping: { [key: string]: string } = {};
    const edgePairs: string[][] = [];
    if (
      connectorPlacement === ConnectorPlacementType.LEFT_RIGHT
      || connectorPlacement === ConnectorPlacementType.TOP_BOTTOM
    ) {
      return { singles: activeEdges, pairs: [] };
    }

    activeEdges.forEach((edgeKey: string) => {
      const currentEdge = edges[edgeKey];
      const edgeSource = nodes[currentEdge.src];
      const edgeDestination = nodes[currentEdge.dest];
      const edgeSrcLabel = `${edgeSource.id}${currentEdge.connectorSrcType || ''}`;
      const edgeDestLabel = `${edgeDestination.id}${currentEdge.connectorDestType || ''}`;
      const edgeMapId = `${edgeSrcLabel}__${edgeDestLabel}`;
      const matchingEdgeId = `${edgeDestLabel}__${edgeSrcLabel}`;
      let edgeOverlap;
      if (edgeMapping[matchingEdgeId]) {
        edgeOverlap = edgeMapping[matchingEdgeId];
        edgePairs.push([currentEdge.id, edgeOverlap]);
        delete edgeMapping[matchingEdgeId];
      } else {
        edgeMapping[edgeMapId] = currentEdge.id;
      }
    });

    const edgeSingles: string[] = Object.keys(edgeMapping).map((val) => edgeMapping[val]);
    return {
      singles: edgeSingles,
      pairs: edgePairs,
    };
  }

  private renderPanels() {
    const { state } = this.props;
    const { panels } = this.props.state;
    const { viewContainerSize } = this.props.state.workspace;
    const renderCallback = this.props.configService.getRenderPanel;
    const destroyCallback = this.props.configService.getRenderDestroy();

    const panelKeys = Object.keys(panels);
    return panelKeys.map((panelKey: string) => (
      <Panel
        positionAnchor={panels[panelKey].positionAnchor}
        key={`panel_${panels[panelKey].id}`}
        id={panels[panelKey].id}
        position={panels[panelKey].position}
        size={panels[panelKey].size}
        renderCallback={renderCallback(panelKey).bind(null, panels[panelKey], state)}
        destroyCallback={destroyCallback}
        viewContainerSize={viewContainerSize}
      />
    ));
  }

  private renderPotentialEdge() {
    const { nodes } = this.props.state;
    const edge = this.props.state.potentialEdge;
    if (!edge) {
      return undefined;
    }
    const nodeId = edge.src;
    const sourceCoordinates = getEdgeCoordinateSource(nodes[nodeId], this.props.configService, edge.connectorSrcType);
    const edgeStyle = getEdgeStyle(
      getConnectorPlacementForNode(nodes[nodeId], this.props.configService),
      this.props.configService.getConnectorPlacement(),
    );
    return (
      <PotentialEdge
        key="potentialEdge"
        src={sourceCoordinates}
        dest={edge.position}
        edgeStyle={edgeStyle}
        showArrowhead={this.props.configService.getShowArrowhead()}
      />
    );
  }

  private renderSelectionMarquee() {
    const marquee = this.props.state.editor.selectionMarquee;
    if (!marquee) {
      return undefined;
    }
    return (
      <SelectionMarquee
        anchor={marquee.anchor}
        position={marquee.position}
      />
    );
  }

  private renderContextMenu() {
    const menu = this.props.state.editor.contextMenu;
    if (!menu) {
      return undefined;
    }
    const renderCallback = this.props.configService.getBoundRenderContextMenu(menu.targetType, menu.targetId);
    const destroyCallback = this.props.configService.getRenderDestroy();
    if (!renderCallback) {
      return undefined;
    }

    return (
      <ContextMenu
        position={menu.position}
        renderCallback={renderCallback}
        destroyCallback={destroyCallback}
      />
    );
  }
}

export { View };
