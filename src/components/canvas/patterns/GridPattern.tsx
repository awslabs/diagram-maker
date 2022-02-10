import * as Preact from 'preact';

export interface GridPatternProps {
  cellSize: number;
  patternSize: number;
}

function GridPattern(props: GridPatternProps): JSX.Element {
  const { cellSize, patternSize } = props;

  return (
    <svg className="dm-grid" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="dm-grid-smallpattern" width={cellSize} height={cellSize} patternUnits="userSpaceOnUse">
          <path d={`M ${cellSize} 0 L 0 0 0 ${cellSize}`} strokeWidth="0.5" />
        </pattern>
        <pattern id="dm-grid-pattern" width={patternSize} height={patternSize} patternUnits="userSpaceOnUse">
          <rect width={patternSize} height={patternSize} fill="url(#dm-grid-smallpattern)" />
          <path d={`M ${patternSize} 0 L 0 0 0 ${patternSize}`} strokeWidth="1" />
        </pattern>
      </defs>
      <rect fill="url(#dm-grid-pattern)" width="100%" height="100%" />
    </svg>
  );
}

export default GridPattern;
