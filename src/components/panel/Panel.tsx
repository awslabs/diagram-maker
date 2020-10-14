import * as classnames from 'classnames';
import * as Preact from 'preact';

import { ComposeView } from 'diagramMaker/components/common';
import { BoundRenderCallback, DestroyCallback } from 'diagramMaker/service/ConfigService';
import { DiagramMakerComponentsType } from 'diagramMaker/service/ui/types';
import { Position, PositionAnchorType, Size  } from 'diagramMaker/state/types';

import './Panel.scss';

export interface PanelProps {
  id: string;
  size: Size;
  position: Position;
  renderCallback: BoundRenderCallback;
  destroyCallback: DestroyCallback;
  viewContainerSize: Size;
  positionAnchor?: PositionAnchorType;
}

const getPosition = (
  x: number,
  y: number,
  positionAnchor: PositionAnchorType,
  panelSize: Size,
  viewContainerSize: Size
): Position => {
  switch (positionAnchor) {
    case PositionAnchorType.TOP_LEFT: {
      return { x, y };
    }
    case PositionAnchorType.TOP_RIGHT: {
      const topRightX = viewContainerSize.width - panelSize.width - x;
      const topRightY = y;

      return { x: topRightX, y: topRightY };
    }
    case PositionAnchorType.BOTTOM_LEFT: {
      const bottomLeftX = x;
      const bottomLeftY = viewContainerSize.height - panelSize.height - y;

      return { x: bottomLeftX, y: bottomLeftY };
    }
    case PositionAnchorType.BOTTOM_RIGHT: {
      const bottomRightX = viewContainerSize.width - panelSize.width - x;
      const bottomRightY = viewContainerSize.height - panelSize.height - y;

      return { x: bottomRightX, y: bottomRightY };
    }
  }
};

export default class Panel extends Preact.Component<PanelProps> {

  public render(): JSX.Element {
    const { x, y } = this.props.position;
    const { width, height } = this.props.size;
    const positionAnchor = this.props.positionAnchor || PositionAnchorType.TOP_LEFT;
    const { destroyCallback, renderCallback, viewContainerSize } = this.props;

    const { x: translateX, y: translateY } = getPosition(x, y, positionAnchor, this.props.size, viewContainerSize);
    const transform = `translate3d(${translateX}px, ${translateY}px, 0)`;

    return (
      <div
        data-id={this.props.id}
        data-type={DiagramMakerComponentsType.PANEL}
        data-event-target={true}
        className="dm-panel"
        style={{ width, height, transform }}
      >
        <ComposeView
          renderCallback={renderCallback}
          destroyCallback={destroyCallback}
        />
      </div>
    );
  }
}
