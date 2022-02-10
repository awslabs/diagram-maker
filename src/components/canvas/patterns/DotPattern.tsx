import * as Preact from 'preact';

export interface DotPatternProps {
  cellSize: number;
  radius: number;
}

const getQuarterCirclePathData = (
  cx: number,
  cy: number,
  r: number,
): string => `M${cx},${cy} m${-r},0 a${r},${r} 0 1,1 ${r * 2},0 a${r},${r} 0 1,1 ${-r * 2},0`;

function DotPattern(props: DotPatternProps): JSX.Element {
  const { cellSize, radius } = props;
  const pathTL = getQuarterCirclePathData(0, 0, radius);
  const pathTR = getQuarterCirclePathData(cellSize, 0, radius);
  const pathBR = getQuarterCirclePathData(cellSize, cellSize, radius);
  const pathBL = getQuarterCirclePathData(0, cellSize, radius);

  return (
    <svg className="dm-dots" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="dm-dot-pattern" width={cellSize} height={cellSize} patternUnits="userSpaceOnUse">
          <path d={pathTL} />
          <path d={pathTR} />
          <path d={pathBR} />
          <path d={pathBL} />
        </pattern>
      </defs>
      <rect fill="url(#dm-dot-pattern)" width="100%" height="100%" />
    </svg>
  );
}

export default DotPattern;
