import classnames from 'classnames';
import * as Preact from 'preact';

import './Canvas.scss';

export interface CanvasProps {
  className?: string | string[];
}

function Canvas(props: Preact.RenderableProps<CanvasProps>): JSX.Element {
  const { children, className } = props;

  return (
    <div className={classnames('dm-canvas', className)}>
      {children}
    </div>
  );
}

export default Canvas;
