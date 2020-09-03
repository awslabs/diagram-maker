import * as classnames from 'classnames';
import * as Preact from 'preact';

import './Canvas.scss';

export interface CanvasProps {
  className?: string | string[];
}

const Canvas = (props: Preact.RenderableProps<CanvasProps>): JSX.Element => {
  const className = classnames('dm-canvas', props.className);

  return (
    <div className={className}>
        {props.children}
    </div>
  );
};

export default Canvas;
