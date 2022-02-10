import { produce } from 'immer';
import clone from 'lodash-es/clone';
import isFinite from 'lodash-es/isFinite';
import isNumber from 'lodash-es/isNumber';
import values from 'lodash-es/values';

import { DiagramMakerData } from 'diagramMaker/state/types';

import { HierarchicalLayoutConfig } from './layoutActions';

// Internal type for manipulating nodes
interface GraphNode {
  id: string;
  neighbors: number[];
  parents: number[];
  isFixed?: boolean;
  x?: number;
  y?: number;
}

enum TraversalStatus { NOT_VISITED, PROCESSING, VISITED }

interface NodeDirection {
  angle: number;
  isFixed: boolean;
}

/**
 * Normalizes any angle to range [0, 2 * PI).
 */
function normalizeAngle(angle: number): number {
  let result = angle;
  while (result < 0) { result += Math.PI * 2; }
  while (result >= Math.PI * 2) { result -= Math.PI * 2; }
  return result;
}

/**
 * Returns true when `angle` is left (or "counter-clockwise") to `angleBase`.
 *
 * An angle is not considered left to itself:
 *   isLeftTurn(a, a) -> false
 *
 * An angle is considered left to diametrically opposite angle:
 *   isLeftTurn(a, a + PI) -> true
 */
function isLeftTurn(angleBase: number, angle: number): boolean {
  const angleOpposite = normalizeAngle(angleBase + Math.PI);

  if (angleBase < Math.PI) {
    return (angle > angleBase && angle <= angleOpposite);
  }
  return (angle > angleBase || angle <= angleOpposite);
}

/**
 * Calculates the angle of vector from `node1` to `node2` relative to X axis.
 */
function getAngle(node1: GraphNode, node2: GraphNode): number {
  const x1 = node1.x as number;
  const y1 = node1.y as number;
  const x2 = node2.x as number;
  const y2 = node2.y as number;

  // Math.atan2(y, x) takes Y coordinate first. WAT?!
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/atan2
  const angle = Math.atan2(y2 - y1, x2 - x1);

  // Math.atan2(y, x) returns angle in the range [-PI, PI].
  // Converting it to the positive range [0, 2 * PI]
  return normalizeAngle(angle);
}

/**
 * Finds the smaller angle between two angles.
 */
function angleBetween(angleA: number, angleB: number): number {
  const angle = Math.abs(angleA - angleB);
  return Math.min(angle, Math.PI * 2 - angle);
}

/**
 * Most functions expect directions to be sorted by the `angle`,
 * so that the traversal will happen around the circle.
 */
function sortNodeDirections(directions: NodeDirection[]): void {
  directions.sort((a, b) => a.angle - b.angle);
}

/**
 * Arranges `nodesCount` number of angles between `fixtures` in the most even way.
 *
 * More technically:
 * Maximizes the smallest angle between any two nodes (free and fixed).
 */
function arrangeEvenly(nodesCount: number, fixtures: NodeDirection[], defaultAngle: number): NodeDirection[] {
  const arrangement: NodeDirection[] = [];

  // No nodes to arrange? Return fixtures unchanged.
  if (nodesCount <= 0) {
    return clone(fixtures);
  }

  // If there is no fixtures, just arrange nodes evenly.
  if (!fixtures.length) {
    const angleIncrement = (Math.PI * 2) / nodesCount;

    // General orientation should point to `defaultAngle`:
    // - For odd number of nodes, one of the nodes points to `defaultAngle`.
    // - For even number of nodes, `defaultAngle` is in the middle between two consecutive nodes.
    let angle = (nodesCount % 2 === 0)
      ? normalizeAngle(defaultAngle + angleIncrement * 0.5)
      : defaultAngle;

    for (let i = 0; i < nodesCount; i += 1) {
      arrangement.push({ angle, isFixed: false });

      angle = normalizeAngle(angle + angleIncrement);
    }

    sortNodeDirections(arrangement);
    return arrangement;
  }

  // Calculate the segments bewteen the fixtures (in angles).
  const segments = [];
  for (let i = 1; i < fixtures.length; i += 1) {
    segments.push(fixtures[i].angle - fixtures[i - 1].angle);
  }
  segments.push((fixtures[0].angle + Math.PI * 2) - fixtures[fixtures.length - 1].angle);

  // Use dynamic programming to figure out the best arrangement.
  // `minAngle[x][y]` equals to the minimum angle in optimal arrangement
  // of Y number nodes in the 0..X segments.
  //
  // As example `minAngle[5][3]` equals to the minimal angle between any nodes,
  // when we arrange 5 nodes in segments 0, 1 and 2.

  // Initialize the table with 0 in each position. That's the worst outcome for optimal arrangement.
  const minAngle: number[][] = [];
  const bestNodesCount: number[][] = [];
  for (let segmentIndex = 0; segmentIndex < segments.length; segmentIndex += 1) {
    minAngle.push([]);
    bestNodesCount.push([]);
    for (let nodes = 0; nodes <= nodesCount; nodes += 1) {
      minAngle[segmentIndex].push(0);
      bestNodesCount[segmentIndex].push(0);
    }
  }

  // Initialize `minAngle[X][0]`. This is when we don't have any nodes to arrange.
  [minAngle[0][0]] = segments;
  bestNodesCount[0][0] = 0;
  for (let segmentIndex = 1; segmentIndex < segments.length; segmentIndex += 1) {
    minAngle[segmentIndex][0] = Math.min(segments[segmentIndex], minAngle[segmentIndex - 1][0]);
    bestNodesCount[segmentIndex][0] = 0;
  }

  // Initialize `minAngle[0][X]`. This is when we arrange X nodes evenly in the first segment.
  for (let nodes = 1; nodes <= nodesCount; nodes += 1) {
    // Squeezing X nodes in a segment splits it into (X + 1) equal subsegments.
    minAngle[0][nodes] = segments[0] / (nodes + 1);
    bestNodesCount[0][nodes] = nodes;
  }

  // Calculate the minimal angle for each remaining cell.
  for (let segmentIndex = 1; segmentIndex < segments.length; segmentIndex += 1) {
    for (let nodes = 1; nodes <= nodesCount; nodes += 1) {
      let best = Math.min(minAngle[segmentIndex - 1][nodes], segments[segmentIndex]);
      let bestNodes = 0;
      for (let x = 1; x <= nodes; x += 1) {
        const current = Math.min(minAngle[segmentIndex - 1][nodes - x], segments[segmentIndex] / (x + 1));
        if (current >= best) {
          best = current;
          bestNodes = x;
        }
      }

      minAngle[segmentIndex][nodes] = best;
      bestNodesCount[segmentIndex][nodes] = bestNodes;
    }
  }

  // Based on the results, extract the optimal number of nodes that should go in each segment.
  const segmentNodesCount: number[] = segments.map(() => 0);
  let remaining = nodesCount;
  for (let segmentIndex = segments.length - 1; segmentIndex >= 0; segmentIndex -= 1) {
    segmentNodesCount[segmentIndex] = bestNodesCount[segmentIndex][remaining];
    remaining -= segmentNodesCount[segmentIndex];
  }

  // Finally, calculate and return the actual angles.
  for (let segmentIndex = 0; segmentIndex < segments.length; segmentIndex += 1) {
    arrangement.push(fixtures[segmentIndex]);
    let { angle } = fixtures[segmentIndex];
    const angleIncrement = segments[segmentIndex] / (segmentNodesCount[segmentIndex] + 1);
    for (let node = 0; node < segmentNodesCount[segmentIndex]; node += 1) {
      angle += angleIncrement;
      angle = normalizeAngle(angle);
      arrangement.push({ angle, isFixed: false });
    }
  }

  sortNodeDirections(arrangement);
  return arrangement;
}

/**
 * Pushes the `angle` towards `targetAngle` with `strength`.
 *
 * The higher `strength` is, the closer `angle` will move towards:
 * - `strength` of 1.0 means that `targetAngle` pushes away with the same force as `angle` is being pushed towards.
 * - `strength` of 2.0 means that `targetAngle` is twice as strong as the `angle`.
 */
function pushTowardsAngle(angle: number, targetAngle: number, strength: number): number {
  const angleIncrement = (strength / (strength + 1)) * angleBetween(angle, targetAngle);
  if (isLeftTurn(angle, targetAngle)) {
    return normalizeAngle(angle + angleIncrement);
  }
  return normalizeAngle(angle - angleIncrement);
}

/**
 * Returns the mean (or "average") of `angles`.
 * Returns NaN, when angles are dimaterically opposite.
 */
function meanOfAngles(angles: number[]): number {
  if (!angles.length) {
    return NaN;
  }

  // https://en.wikipedia.org/wiki/Mean_of_circular_quantities#Mean_of_angles
  const x = angles
    .map((a) => Math.cos(a))
    .reduce((acc, value) => acc + value, 0);

  const y = angles
    .map((a) => Math.sin(a))
    .reduce((acc, value) => acc + value, 0);

  if (Math.abs(x) < 0.001 && Math.abs(y) < 0.001) {
    // The centroid is very close to the origin (0, 0)
    // which means that all angles balance each other out.
    return NaN;
  }
  return normalizeAngle(Math.atan2(y, x));
}

/**
 * Moves all nodes in the direction of `gravityAngle` while not pressing too hard against the neighbors.
 * Fixed directions are not moved.
 */
function applyGravity(
  originalDirections: NodeDirection[],
  gravityAngle: number,
  gravityStrength: number,
): NodeDirection[] {
  // No nodes or no gravity, nothing to do here.
  if (!originalDirections.length || gravityStrength <= 0) {
    return originalDirections;
  }

  const directions = originalDirections.map((direction) => ({ ...direction }));

  // If it's one node and it's free, move it to `gravityAngle`.
  // If it's fixed, nothing to do.
  if (directions.length === 1) {
    if (!directions[0].isFixed) {
      directions[0].angle = gravityAngle;
    }
    return directions;
  }

  const incIndex = (i: number) => ((i + 1) % directions.length);
  const decIndex = (i: number) => (i === 0 ? (directions.length - 1) : (i - 1));

  // Find two nodes exactly before and after `gravityAngle`.
  let nextIndex = 0;
  while (nextIndex < directions.length - 1 && directions[nextIndex].angle < gravityAngle) {
    nextIndex += 1;
  }
  if (directions[nextIndex].angle < gravityAngle) {
    nextIndex = 0;
  }

  const previousIndex = decIndex(nextIndex);

  const anglePrevious = directions[previousIndex].angle;
  const angleNext = directions[nextIndex].angle;

  // Push `previousIndex` and `nextIndex` towards `gravityAngle` with a "special care":
  // Consider which of them are fixed and which are free and push the closest right to `gravityAngle`,
  // while also ensuring that we don't press towards the neighbor too hard.

  if (directions[previousIndex].isFixed && directions[nextIndex].isFixed) {
    // Both sides are fixed, nothing to do.
  } else if (directions[previousIndex].isFixed) {
    // If `previousIndex` is fixed, move the free `nextIndex` towards gravity.
    const pushedAngle = pushTowardsAngle(angleNext, anglePrevious, gravityStrength);
    if (angleBetween(gravityAngle, anglePrevious) >= angleBetween(pushedAngle, anglePrevious)) {
      // If moving node directly to `gravityAngle` won't squeeze it too hard to neighbor, let's do it.
      directions[nextIndex].angle = gravityAngle;
    } else {
      // However if it gets too close, use regular `pushTowardsAngle` formula instead.
      directions[nextIndex].angle = pushedAngle;
    }
  } else if (directions[nextIndex].isFixed) {
    // If `nextIndex` is fixed, move the free `previousIndex` towards gravity.
    const pushedAngle = pushTowardsAngle(anglePrevious, angleNext, gravityStrength);
    if (angleBetween(gravityAngle, angleNext) >= angleBetween(pushedAngle, angleNext)) {
      // If moving node directly to `gravityAngle` won't squeeze it too hard to neighbor, let's do it.
      directions[previousIndex].angle = gravityAngle;
    } else {
      // However if it gets too close, use regular `pushTowardsAngle` formula instead.
      directions[previousIndex].angle = pushedAngle;
    }
  } else {
    // Both `previousIndex` and `nextIndex` are free.
    const anglePreviousToGravity = angleBetween(anglePrevious, gravityAngle);
    const angleNextToGravity = angleBetween(angleNext, gravityAngle);
    if (Math.abs(angleNextToGravity - anglePreviousToGravity) < 0.01) {
      // Two free nodes are equally close to gravity. Move them equally closer, based on `gravityStrength`.
      directions[previousIndex].angle = pushTowardsAngle(
        directions[previousIndex].angle,
        gravityAngle,
        gravityStrength,
      );

      directions[nextIndex].angle = pushTowardsAngle(directions[nextIndex].angle, gravityAngle, gravityStrength);
    } else if (anglePreviousToGravity <= angleNextToGravity) {
      // `previousIndex` is closer to `gravityAngle`. Move it right to `gravityAngle`.
      directions[previousIndex].angle = gravityAngle;
      directions[nextIndex].angle = pushTowardsAngle(angleNext, gravityAngle, gravityStrength);
    } else {
      // `nextIndex` is closer to `gravityAngle`. Move it right to `gravityAngle`.
      directions[nextIndex].angle = gravityAngle;
      directions[previousIndex].angle = pushTowardsAngle(anglePrevious, gravityAngle, gravityStrength);
    }
  }

  // Going counter-clockwise until we reach the diamterically opposite angle to `gravityAngle`.
  let index = incIndex(nextIndex);
  while (index !== previousIndex && isLeftTurn(gravityAngle, directions[index].angle)) {
    if (!directions[index].isFixed) {
      directions[index].angle = pushTowardsAngle(
        directions[index].angle,
        directions[decIndex(index)].angle,
        gravityStrength,
      );
    }
    index = incIndex(index);
  }

  // Going clockwise until we reach the diamterically opposite angle to `gravityAngle`.
  index = decIndex(previousIndex);
  while (index !== nextIndex && !isLeftTurn(gravityAngle, directions[index].angle)) {
    if (!directions[index].isFixed) {
      directions[index].angle = pushTowardsAngle(
        directions[index].angle,
        directions[incIndex(index)].angle,
        gravityStrength,
      );
    }
    index = decIndex(index);
  }

  sortNodeDirections(directions);

  return directions;
}

export default function hierarchicalLayout<NodeType, EdgeType>(
  state: DiagramMakerData<NodeType, EdgeType>,
  layoutConfig: HierarchicalLayoutConfig,
): DiagramMakerData<NodeType, EdgeType> {
  // Initialize config values with defaults, if needed.
  const { distanceMin } = layoutConfig;
  const distanceMax = isNumber(layoutConfig.distanceMax) ? layoutConfig.distanceMax : (3 * distanceMin);
  const distanceDeclineRate = isNumber(layoutConfig.distanceDeclineRate) ? layoutConfig.distanceDeclineRate : 0.3;

  const initialGravityAngle = isNumber(layoutConfig.gravityAngle)
    ? normalizeAngle(-layoutConfig.gravityAngle) // As Y-axis points down, the angle must be inverted.
    : (Math.PI * 0.5); // Default gravity points straight down.

  const gravityStrength = isNumber(layoutConfig.gravityStrength) ? layoutConfig.gravityStrength : 0.0;

  // Construct an initial graph without calculated positioning.
  const fixedNodeIdSet: { [key: string]: boolean } = {};
  layoutConfig.fixedNodeIds.forEach((nodeId) => { fixedNodeIdSet[nodeId] = true; });

  const fixedNodes: number[] = [];
  const nodeIndex: { [key: string]: number } = {};
  const graph: GraphNode[] = values(state.nodes).map((node, index) => {
    nodeIndex[node.id] = index;

    const graphNode: GraphNode = {
      id: node.id,
      neighbors: [],
      parents: [],
    };

    const { position } = node.diagramMakerData;
    const { size } = node.diagramMakerData;
    if (fixedNodeIdSet[node.id]) {
      graphNode.isFixed = true;
      graphNode.x = position.x + size.width / 2;
      graphNode.y = position.y + size.height / 2;

      fixedNodes.push(index);
    }
    return graphNode;
  });

  // Add neighbor information based on DiagramMaker edges.
  values(state.edges).forEach((edge) => {
    const srcIndex = nodeIndex[edge.src];
    const destIndex = nodeIndex[edge.dest];

    // Note:
    // The directionality of the graph is ignored.
    // No matter if we're laying out children nodes around the parent,
    // or parent nodes around the child, the same rules spread in both directions.
    graph[srcIndex].neighbors.push(destIndex);
    graph[destIndex].neighbors.push(srcIndex);
  });

  // Calculate positioning during BFS traversal.
  const nodeStatus: TraversalStatus[] = graph.map(
    (node) => (node.isFixed ? TraversalStatus.VISITED : TraversalStatus.NOT_VISITED),
  );

  let currentLayer: number[] = fixedNodes;
  let r: number = distanceMax;
  while (currentLayer.length) {
    const radius = r;
    // Mark current layer as VISITED.
    currentLayer.forEach((node) => {
      nodeStatus[node] = TraversalStatus.VISITED;
    });

    // Calculate next layer by traversing neighbors of the current layer.
    const nextLayer: number[] = [];
    currentLayer.forEach((node) => {
      graph[node].neighbors.forEach((neighbor) => {
        if (nodeStatus[neighbor] === TraversalStatus.VISITED) { return; }

        graph[neighbor].parents.push(node);
        if (nodeStatus[neighbor] === TraversalStatus.NOT_VISITED) {
          nextLayer.push(neighbor);
          nodeStatus[neighbor] = TraversalStatus.PROCESSING;
        }
      });
    });

    // Position the next layer.

    // Start with the nodes that are connected to multiple fixed parents.
    // Place them in the centroid of all of their parents.
    nextLayer.forEach((node) => {
      if (graph[node].parents.length > 1) {
        const parentsCount = graph[node].parents.length;

        const sumX = graph[node].parents.reduce((sum, parent) => sum + (graph[parent].x as number), 0);
        graph[node].x = sumX / parentsCount;

        const sumY = graph[node].parents.reduce((sum, parent) => sum + (graph[parent].y as number), 0);
        graph[node].y = sumY / parentsCount;

        graph[node].isFixed = true;
      }
    });

    // Calculate the fixtures (angles that are already fixed) for each node in the current layer.
    const fixtures: NodeDirection[][] = graph.map(() => []);
    currentLayer.forEach((node) => {
      graph[node].neighbors.forEach((neighbor) => {
        if (graph[neighbor].isFixed) {
          fixtures[node].push({
            angle: getAngle(graph[node], graph[neighbor]),
            isFixed: true,
          });
        }
      });
      sortNodeDirections(fixtures[node]);
    });

    // Distribute all remaining free-hanging nodes between the fixtures.
    currentLayer.forEach((node) => {
      let gravityAngle = initialGravityAngle;

      const meanOfFixtures = meanOfAngles(fixtures[node].map((fixture) => fixture.angle));
      if (!Number.isNaN(meanOfFixtures)) {
        gravityAngle = normalizeAngle(meanOfFixtures + Math.PI);
      }

      const freeNodesCount = graph[node].neighbors.length - fixtures[node].length;
      const tempArrangement = arrangeEvenly(freeNodesCount, fixtures[node], gravityAngle);

      const arrangement = applyGravity(tempArrangement, gravityAngle, gravityStrength);

      let arrangementIndex = 0;
      graph[node].neighbors.forEach((neighbor) => {
        if (!graph[neighbor].isFixed) {
          while (arrangement[arrangementIndex].isFixed) {
            arrangementIndex += 1;
          }
          const { angle } = arrangement[arrangementIndex];
          graph[neighbor].x = (graph[node].x as number) + Math.cos(angle) * radius;
          graph[neighbor].y = (graph[node].y as number) + Math.sin(angle) * radius;
          graph[neighbor].isFixed = true;

          arrangementIndex += 1;
        }
      });
    });

    // Move on to the next layer.
    currentLayer = nextLayer;
    r = distanceMin + (radius - distanceMin) * (1 - distanceDeclineRate);
  }

  // Update the original data with the calculated values.
  return produce(state, (draftState) => {
    graph.forEach((node) => {
      if (isFinite(node.x) && isFinite(node.y)) {
        const nodeSize = draftState.nodes[node.id].diagramMakerData.size;
        draftState.nodes[node.id].diagramMakerData.position = {
          x: (node.x as number) - nodeSize.width / 2,
          y: (node.y as number) - nodeSize.height / 2,
        };
      }
    });
  });
}
