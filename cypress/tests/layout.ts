import { getElementByDataIdAndType, getNodeById, getWorkspace } from '../common/getters';
import { convertTranslate2dToMatrix } from '../common/utils';

describe('DiagramMaker Layout', () => {
  beforeEach(() => {
    cy.visit('/Layout.html');
  });
  const toolsType = 'DiagramMaker.Tools';
  const workspace = { width: 1200, height: 800 };
  const nodeRect = { width: 300, height: 100 };
  const distanceMin = 200;

  describe('WorkflowLayput', () => {
    it('resize workspace when nodes beyond boundary', () => {
      const layoutId = 'WorkflowLayout';
      getElementByDataIdAndType(layoutId, toolsType).click();
      const leftPadding = nodeRect.width / 2;
      const rightMost = leftPadding + nodeRect.width + 2 * (nodeRect.width + distanceMin);
      const expectedWidth = Math.max(rightMost, workspace.width);
      getWorkspace().should('have.css', 'width', `${expectedWidth}px`);
      const node1Pos = { x: 150, y: 350 };
      const node2Pos = { x: 650, y: 50 };
      const node3Pos = { x: 1150, y: 50 };
      const node4Pos = { x: 650, y: 350 };
      const node5Pos = { x: 650, y: 650 };

      const node1ExpectedTransform = convertTranslate2dToMatrix(node1Pos.x, node1Pos.y);
      const node2ExpectedTransform = convertTranslate2dToMatrix(node2Pos.x, node2Pos.y);
      const node3ExpectedTransform = convertTranslate2dToMatrix(node3Pos.x, node3Pos.y);
      const node4ExpectedTransform = convertTranslate2dToMatrix(node4Pos.x, node4Pos.y);
      const node5ExpectedTransform = convertTranslate2dToMatrix(node5Pos.x, node5Pos.y);
      getNodeById('node1').should('have.css', 'transform').and('eq', node1ExpectedTransform);
      getNodeById('node2').should('have.css', 'transform').and('eq', node2ExpectedTransform);
      getNodeById('node3').should('have.css', 'transform').and('eq', node3ExpectedTransform);
      getNodeById('node4').should('have.css', 'transform').and('eq', node4ExpectedTransform);
      getNodeById('node5').should('have.css', 'transform').and('eq', node5ExpectedTransform);
    });
  });

  describe('HierarchicalLayput', () => {
    it('resize workspace when nodes beyond boundary', () => {
      const layoutId = 'HierarchicalLayout';
      getElementByDataIdAndType(layoutId, toolsType).click();
      // Todo: Figure out how to calculate these distance
      const distance1 = 200;
      const distance2 = 500;
      const distance3 = 380;
      const expectedHeight = 4 * nodeRect.height + distance1 + distance2 + distance3;
      getWorkspace().should('have.css', 'height', `${expectedHeight}px`);

      const node1Pos = { x: 519.615, y: 300 };
      const node2Pos = { x: 519.615, y: 900 };
      const node3Pos = { x: 519.615, y: 1380 };
      const node4Pos = { x: 0, y: 4.54747e-13 };
      const node5Pos = { x: 1039.23, y: 0 };

      const node1ExpectedTransform = convertTranslate2dToMatrix(node1Pos.x, node1Pos.y);
      const node2ExpectedTransform = convertTranslate2dToMatrix(node2Pos.x, node2Pos.y);
      const node3ExpectedTransform = convertTranslate2dToMatrix(node3Pos.x, node3Pos.y);
      const node4ExpectedTransform = convertTranslate2dToMatrix(node4Pos.x, node4Pos.y);
      const node5ExpectedTransform = convertTranslate2dToMatrix(node5Pos.x, node5Pos.y);
      getNodeById('node1').should('have.css', 'transform').and('eq', node1ExpectedTransform);
      getNodeById('node2').should('have.css', 'transform').and('eq', node2ExpectedTransform);
      getNodeById('node3').should('have.css', 'transform').and('eq', node3ExpectedTransform);
      getNodeById('node4').should('have.css', 'transform').and('eq', node4ExpectedTransform);
      getNodeById('node5').should('have.css', 'transform').and('eq', node5ExpectedTransform);
    });
  });
});
