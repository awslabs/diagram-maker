import * as classnames from 'classnames';
import * as Preact from 'preact';

import { getInflectionPoint } from 'diagramMaker/service/positionUtils';
import { Position } from 'diagramMaker/state/types';

// @NOTE: Depending on node connector placement
// the bezier curve is drawn differently, so we have two types
export enum EdgeStyle {
  LEFT_RIGHT_BEZIER,
  TOP_BOTTOM_BEZIER,
  STRAIGHT,
  QUADRATIC_BEZIER
}

export interface EdgeCurveProps {
  src: Position;
  dest: Position;
  edgeStyle: EdgeStyle;
  className?: string;
  showArrowhead?: boolean;
}

const getQuadraticBezierPath = (src: Position, dest: Position, className?: string, markerEnd?: string): JSX.Element => {
  const { x: x1, y: y1 } = src;
  const { x: x2, y: y2 } = dest;
  const { x: startingX, y: startingY } = getInflectionPoint(src, dest);
  const classNames = classnames('dm-path', className);

  const pathData = `M${x1},${y1} Q${startingX},${startingY} ${x2},${y2}`;
  return <path className={classNames} d={pathData} markerEnd={markerEnd} />;
};

const getLeftRightBezierPath = (src: Position, dest: Position, className?: string, markerEnd?: string): JSX.Element => {
  const { x: x1, y: y1 } = src;
  const { x: x2, y: y2 } = dest;
  const width = x2 - x1;
  const halfWidth = width / 2;
  const classNames = classnames('dm-path', className);

  const pathData = `M${x1},${y1} C${x1 + Math.abs(halfWidth)},${y1} ${x2 - Math.abs(halfWidth)},${y2} ${x2},${y2}`;
  return <path className={classNames} d={pathData} markerEnd={markerEnd} />;
};

const getTopBottomBezierPath = (src: Position, dest: Position, className?: string, markerEnd?: string): JSX.Element => {
  const { x: x1, y: y1 } = src;
  const { x: x2, y: y2 } = dest;
  const height = y2 - y1;
  const halfHeight = height / 2;
  const classNames = classnames('dm-path', className);

  const pathData = `M${x1},${y1} C${x1},${y1 + Math.abs(halfHeight)} ${x2},${y2 - Math.abs(halfHeight)} ${x2},${y2}`;
  return <path className={classNames} d={pathData} markerEnd={markerEnd} />;
};

const getStraightPath = (src: Position, dest: Position, className?: string, markerEnd?: string): JSX.Element => {
  const classNames = classnames('dm-path', className);
  return <line className={classNames} x1={src.x} y1={src.y} x2={dest.x} y2={dest.y} markerEnd={markerEnd} />;
};

const EdgeCurve = (props: Preact.RenderableProps<EdgeCurveProps>): JSX.Element => {
  const { src, dest, edgeStyle, className, showArrowhead } = props;
  let markerEnd;
  if (showArrowhead) {
    markerEnd = 'url(#arrow)';
  }
  switch (edgeStyle) {
    case EdgeStyle.LEFT_RIGHT_BEZIER:
      return getLeftRightBezierPath(src, dest, className, markerEnd);
    case EdgeStyle.TOP_BOTTOM_BEZIER:
      return getTopBottomBezierPath(src, dest, className, markerEnd);
    case EdgeStyle.STRAIGHT:
      return getStraightPath(src, dest, className, markerEnd);
    case EdgeStyle.QUADRATIC_BEZIER:
      return getQuadraticBezierPath(src, dest, className, markerEnd);
  }
};

export default EdgeCurve;
