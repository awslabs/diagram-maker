import classnames from 'classnames';
import * as Preact from 'preact';

import Canvas from 'diagramMaker/components/canvas/Canvas';
import DotPattern from 'diagramMaker/components/canvas/patterns/DotPattern';
import { DiagramMakerComponentsType } from 'diagramMaker/service/ui/types';
import { Position, Size } from 'diagramMaker/state/types';

import './Workspace.scss';

export interface WorkspaceProps {
  canvasPattern?: JSX.Element;
  className?: string | string[];
  position: Position;
  scale: number;
  canvasSize: Size;
}

export const DEFAULT_CANVAS_PATTERN: JSX.Element = <DotPattern cellSize={10} radius={1} />;

function Workspace(props: Preact.RenderableProps<WorkspaceProps>): JSX.Element {
  const {
    canvasPattern, canvasSize, children, className, position, scale,
  } = props;
  const { height, width } = canvasSize;
  const { x, y } = position;

  const transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;

  const pattern = canvasPattern || DEFAULT_CANVAS_PATTERN;

  return (
    <div
      className={classnames('dm-workspace', className)}
      style={{ height, width, transform }}
      data-type={DiagramMakerComponentsType.WORKSPACE}
      data-event-target
      data-draggable
      data-dropzone
    >
      <Canvas>
        {pattern}
      </Canvas>
      {children}
    </div>
  );
}

export default Workspace;
