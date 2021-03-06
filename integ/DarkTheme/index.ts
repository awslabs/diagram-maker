import { renderDiagramMaker } from './render';

const windowAsAny = window as any;

renderDiagramMaker();

if (process.env.NODE_ENV !== 'production' && module.hot) {
  module.hot.accept('./render', () => {
    windowAsAny.diagramMaker.destroy();
    renderDiagramMaker();
  });
}
