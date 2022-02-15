import classnames from 'classnames';
import * as Preact from 'preact';

import { DiagramMakerComponentsType } from 'diagramMaker/service/ui/types';
import { Position } from 'diagramMaker/state/types';

import EdgeCurve, { EdgeStyle } from './EdgeCurve';

import './Edge.scss';

export interface EdgeProps {
  id: string;
  src: Position;
  dest: Position;
  edgeStyle: EdgeStyle;
  srcTypeId?: string;
  destTypeId?: string;
  selected?: boolean;
  className?: string | string[];
  showArrowhead?: boolean;
}

// @TODO: Make edge and label fully interactive like nodes
export default class Edge extends Preact.Component<EdgeProps> {
  private static getCurve = (
    src: Position,
    dest: Position,
    edgeStyle: EdgeStyle,
    className: string,
    showArrowhead?: boolean,
  ) => <EdgeCurve src={src} dest={dest} edgeStyle={edgeStyle} className={className} showArrowhead={showArrowhead} />;

  public render() {
    const {
      src, dest, className, edgeStyle, id, selected, showArrowhead,
    } = this.props;

    const classNames = classnames('dm-edge', className, { 'dm-selected': selected });

    const curvePathInner = Edge.getCurve(src, dest, edgeStyle, 'dm-path-inner', showArrowhead);
    const curvePathOuter = Edge.getCurve(src, dest, edgeStyle, 'dm-path-outer', showArrowhead);

    return (
      <g
        className={classNames}
        data-id={id}
        data-type={DiagramMakerComponentsType.EDGE}
        data-event-target
        data-edge-source-type={this.props.srcTypeId}
        data-edge-dest-type={this.props.destTypeId}
      >
        {curvePathInner}
        {curvePathOuter}
      </g>
    );
  }
}
