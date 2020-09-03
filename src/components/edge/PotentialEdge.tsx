import * as classnames from 'classnames';
import * as Preact from 'preact';

import { DiagramMakerComponentsType } from 'diagramMaker/service/ui/types';
import { Position } from 'diagramMaker/state/types';

import { default as EdgeCurve, EdgeStyle } from './EdgeCurve';

import './Edge.scss';

export interface PotentialEdgeProps {
  src: Position;
  dest: Position;
  edgeStyle: EdgeStyle;
  className?: string | string[];
  showArrowhead?: boolean;
}

const getCurve = (
    src: Position, dest: Position, edgeStyle: EdgeStyle, className: string, showArrowhead?: boolean
  ) =>
    <EdgeCurve src={src} dest={dest} edgeStyle={edgeStyle} className={className} showArrowhead={showArrowhead} />;

const PotentialEdge = (props: Preact.RenderableProps<PotentialEdgeProps>): JSX.Element => {
  const { src, dest, className, edgeStyle, showArrowhead } = props;

  const classNames = classnames('dm-edge', className);

  const curvePath = getCurve(src, dest, edgeStyle, 'dm-path-inner', showArrowhead);

  return(
    <g
      className={classNames}
      data-type={DiagramMakerComponentsType.POTENTIAL_EDGE}
    >
      {curvePath}
    </g>
  );
};

export default PotentialEdge;
