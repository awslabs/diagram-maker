import { DiagramMakerComponentsType } from 'diagramMaker/service/ui/types';
import { Position, Size } from 'diagramMaker/state/types';
import * as Preact from 'preact';

import './SelectionMarquee.scss';

export interface SelectionMarqueeProps {
  anchor: Position;
  position: Position;
}

interface MarqueeDimensions {
  left: number;
  top: number;
  width: number;
  height: number;
}

export default class SelectionMarquee extends Preact.Component<SelectionMarqueeProps> {
  public render(): JSX.Element {
    const { anchor, position } = this.props;
    const { left, top, width, height } = this.getMarqueeDimensions(anchor, position);
    const classes = 'dm-marquee';
    const style = {
      height,
      left,
      top,
      width
    };

    return(
      <div
        className={classes}
        style={style}
        data-event-target={true}
        data-type={DiagramMakerComponentsType.SELECTION_MARQUEE}
      />
    );
  }

  private getMarqueeDimensions(anchor: Position, position: Position): MarqueeDimensions {
    const left = Math.min(anchor.x, position.x);
    const top = Math.min(anchor.y, position.y);
    const width = Math.abs(anchor.x - position.x);
    const height = Math.abs(anchor.y - position.y);
    return { left, top, width, height };
  }
}
