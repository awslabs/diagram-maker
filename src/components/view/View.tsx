import * as Preact from 'preact';

import { ContextMenu } from 'diagramMaker/components/contextMenu';
import { Edge, EdgeBadge, EdgeStyle, PotentialEdge } from 'diagramMaker/components/edge';
import { Node, PotentialNode } from 'diagramMaker/components/node';
import { Panel } from 'diagramMaker/components/panel';
import { SelectionMarquee } from 'diagramMaker/components/selectionMarquee';
import { Workspace } from 'diagramMaker/components/workspace';
import ConfigService, {
  ConnectorPlacement, ConnectorPlacementType, DestroyCallback, Shape, ShapeType, TypeForVisibleConnectorTypes
} from 'diagramMaker/service/ConfigService';
import { getInflectionPoint } from 'diagramMaker/service/positionUtils';
import { DiagramMakerComponentsType } from 'diagramMaker/service/ui/types';
import {
  DiagramMakerData,
  DiagramMakerEdge,
  DiagramMakerEdges,
  DiagramMakerNode,
  Position,
  Size
} from 'diagramMaker/state/types';

import './View.scss';

const CONNECTOR_PLACEMENT_TO_EDGE_TYPE = {
  [ConnectorPlacement.LEFT_RIGHT]: EdgeStyle.LEFT_RIGHT_BEZIER,
  [ConnectorPlacement.TOP_BOTTOM]: EdgeStyle.TOP_BOTTOM_BEZIER,
  [ConnectorPlacement.CENTERED]: EdgeStyle.STRAIGHT,
  [ConnectorPlacement.BOUNDARY]: EdgeStyle.STRAIGHT
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
  configService: ConfigService<NodeType, EdgeType>
) => {
  const typeId = node.typeId;
  if (!typeId) {
    return configService.getConnectorPlacement();
  }

  return configService.getConnectorPlacementForNodeType(typeId);
};

const getCenteredConnectorCoordinates =
<NodeType extends any>(node: DiagramMakerNode<NodeType>): Position => {
  const { position, size } = node.diagramMakerData;
  return {
    x: position.x + size.width / 2,
    y: position.y + size.height / 2
  };
};

const getLeftRightConnectorCoordinatesSource =
<NodeType extends any>(node: DiagramMakerNode<NodeType>): Position => {
  const { position, size } = node.diagramMakerData;
  return {
    x: position.x + size.width,
    y: position.y + size.height / 2
  };
};

const getLeftRightConnectorCoordinatesDestination =
<NodeType extends any>(node: DiagramMakerNode<NodeType>): Position => {
  const { position, size } = node.diagramMakerData;
  return {
    x: position.x,
    y: position.y + size.height / 2
  };
};

const getTopBottomConnectorCoordinatesDestination =
<NodeType extends any>(node: DiagramMakerNode<NodeType>): Position => {
  const { position, size } = node.diagramMakerData;
  return {
    x: position.x + size.width / 2,
    y: position.y
  };
};

const getTopBottomConnectorCoordinatesSource =
<NodeType extends any>(node: DiagramMakerNode<NodeType>): Position => {
  const { position, size } = node.diagramMakerData;
  return {
    x: position.x + size.width / 2,
    y: position.y + size.height
  };
};

const getEdgeCoordinateSource =
<NodeType, EdgeType>(
  node: DiagramMakerNode<NodeType>,
  configService: ConfigService<NodeType, EdgeType>
): Position => {
  let sourceCoordinates: Position;
  const connectorPlacement = getConnectorPlacementForNode(node, configService);
  if (connectorPlacement === ConnectorPlacement.LEFT_RIGHT) {
    sourceCoordinates = getLeftRightConnectorCoordinatesSource(node);
  } else if (connectorPlacement === ConnectorPlacement.TOP_BOTTOM) {
    sourceCoordinates = getTopBottomConnectorCoordinatesSource(node);
  } else {
    sourceCoordinates = getCenteredConnectorCoordinates(node);
  }
  return sourceCoordinates;
};

const getEdgeCoordinateDestination =
<NodeType, EdgeType>(
  node: DiagramMakerNode<NodeType>,
  configService: ConfigService<NodeType, EdgeType>
): Position => {
  let sourceCoordinates: Position;
  const connectorPlacement = getConnectorPlacementForNode(node, configService);
  if (connectorPlacement === ConnectorPlacement.LEFT_RIGHT) {
    sourceCoordinates = getLeftRightConnectorCoordinatesDestination(node);
  } else if (connectorPlacement === ConnectorPlacement.TOP_BOTTOM) {
    sourceCoordinates = getTopBottomConnectorCoordinatesDestination(node);
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
  destinationPosition: Position
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
    y: ((m * y2) + (n * y1)) / distance
  };
};

const getBoundaryCoordinates = (
  sourcePosition: Position,
  sourceShape: ShapeType | undefined,
  sourceSize: Size,
  destPosition: Position
): Position => {
  switch (sourceShape) {
    case Shape.CIRCLE:
      return getBoundaryCoordinatesForCircle(sourcePosition, sourceSize, destPosition);
  }
  return sourcePosition;
};

const applyBoundaryCheck =
<NodeType, EdgeType>(
  configService: ConfigService<NodeType, EdgeType>,
  nodeSrc: DiagramMakerNode<NodeType>,
  positionSrc: Position,
  positionDest: Position
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
      positionDest
    );
  }

  return positionSrc;
};

const getEdgeCoordinatePair =
<NodeType, EdgeType>(
  nodeSrc: DiagramMakerNode<NodeType>,
  nodeDest: DiagramMakerNode<NodeType>,
  configService: ConfigService<NodeType, EdgeType>,
  overlappingEdge?: boolean
): EdgeCoordinatePair => {
  const coordinates: EdgeCoordinatePair = {
    src: getEdgeCoordinateSource(nodeSrc, configService),
    dest: getEdgeCoordinateDestination(nodeDest, configService)
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
    dest: newDest
  };
};

const getEdgeStyle = (
  sourceConnectorPlacement: ConnectorPlacementType,
  destinationConnectorPlacement: ConnectorPlacementType
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
      scale: workspaceScale
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
      return;
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
    const nodes = this.props.state.nodes;
    const renderCallback = this.props.configService.getRenderNode();
    const destroyCallback = this.props.configService.getRenderDestroy();
    const nodeKeys = Object.keys(nodes);
    return nodeKeys.map((nodeKey: string) => {
      const typeId = nodes[nodeKey].typeId;
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
      return;
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
      pairEdges = pairEdges.concat(edgePair.map(edgeKey => this.renderEdge(edgeKey, true)));
    });

    const singleEdges = edgeSingles.map(edgeKey => this.renderEdge(edgeKey));

    return singleEdges.concat(pairEdges);
  }

  private renderEdge(edgeKey: string, isEdgePair?: boolean) {
    const nodes = this.props.state.nodes;
    const edges = this.props.state.edges;
    const edgeSource = nodes[edges[edgeKey].src];
    const edgeDestination = nodes[edges[edgeKey].dest];
    const edgeCoordinates = getEdgeCoordinatePair(
        edgeSource,
        edgeDestination,
        this.props.configService,
        isEdgePair
      );
    const edgeStyle = isEdgePair ? EdgeStyle.QUADRATIC_BEZIER : getEdgeStyle(
      getConnectorPlacementForNode(edgeSource, this.props.configService),
      getConnectorPlacementForNode(edgeDestination, this.props.configService)
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
    const nodes = this.props.state.nodes;
    const edges = this.props.state.edges;
    const renderCallback = this.props.configService.getRenderEdge();
    const destroyCallback = this.props.configService.getRenderDestroy();

    if (!renderCallback) {
      return;
    }

    const { singles: edgeSingles, pairs: edgePairs } = this.getEdges();
    let pairEdges: JSX.Element[] = [];
    edgePairs.forEach((edgePair: string[]) => {
      pairEdges = pairEdges.concat(edgePair.map((edgeKey: string, index: number) => {
        const edgeCoordinates = getEdgeCoordinatePair(
          nodes[edges[edgeKey].src],
          nodes[edges[edgeKey].dest],
          this.props.configService,
          true
        );

        return (
          <EdgeBadge
            id={edgeKey}
            key={`edgeBadge_${edges[edgeKey].id}`}
            src={edgeCoordinates.src}
            dest={edgeCoordinates.dest}
            renderCallback={renderCallback.bind(null, edges[edgeKey])}
            destroyCallback={destroyCallback}
            isPartOfEdgePair={true}
          />
        );
      }));
    });

    const singleEdges = edgeSingles
      .map((edgeKey: string) => {
        const edgeCoordinates = getEdgeCoordinatePair(
          nodes[edges[edgeKey].src],
          nodes[edges[edgeKey].dest],
          this.props.configService
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

  private getEdges(): { singles: string[], pairs: string[][]} {
    const nodes = this.props.state.nodes;
    const edges = this.props.state.edges;
    const edgeKeys = Object.keys(edges);
    const activeEdges = edgeKeys.filter(
      (edgeKey: string) => !!(nodes[edges[edgeKey].src] && nodes[edges[edgeKey].dest])
    );
    const connectorPlacement = this.props.configService.getConnectorPlacement();
    const edgeMapping: { [key: string]: string } = {};
    const edgePairs: string[][] = [];
    if (
      connectorPlacement === ConnectorPlacementType.LEFT_RIGHT ||
      connectorPlacement === ConnectorPlacementType.TOP_BOTTOM
    ) {
      return { singles: activeEdges, pairs: [] };
    }

    activeEdges.forEach((edgeKey: string) => {
      const currentEdge = edges[edgeKey];
      const edgeSource = nodes[currentEdge.src];
      const edgeDestination = nodes[currentEdge.dest];
      const edgeMapId = `${edgeSource.id}__${edgeDestination.id}`;
      const matchingEdgeId = `${edgeDestination.id}__${edgeSource.id}`;
      let edgeOverlap;
      if (edgeMapping[matchingEdgeId]) {
        edgeOverlap = edgeMapping[matchingEdgeId];
        edgePairs.push([currentEdge.id, edgeOverlap]);
        delete edgeMapping[matchingEdgeId];
      } else {
        edgeMapping[edgeMapId] = currentEdge.id;
      }
    });

    const edgeSingles: string[] = Object.keys(edgeMapping).map(val => edgeMapping[val]);
    return {
      singles: edgeSingles,
      pairs: edgePairs
    };
  }

  private renderPanels() {
    const state = this.props.state;
    const panels = this.props.state.panels;
    const viewContainerSize = this.props.state.workspace.viewContainerSize;
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
    const nodes = this.props.state.nodes;
    const edge = this.props.state.potentialEdge;
    if (!edge) {
      return;
    }

    const sourceCoordinates = getEdgeCoordinateSource(nodes[edge.src], this.props.configService);
    const edgeStyle = getEdgeStyle(
      getConnectorPlacementForNode(nodes[edge.src], this.props.configService),
      this.props.configService.getConnectorPlacement()
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
      return;
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
      return;
    }
    const renderCallback = this.props.configService.getBoundRenderContextMenu(menu.targetType, menu.targetId);
    const destroyCallback = this.props.configService.getRenderDestroy();
    if (!renderCallback) {
      return;
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
