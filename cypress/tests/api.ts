import {
  getAllEdges, getAllNodes, getDiagramMakerView, getEdgeById, getElementByDataIdAndType, getNodeById,
  getPanelById, getPotentialEdge, getPotentialNodeById, getSelectionMarquee, getWorkspace,
} from '../common/getters';
import {
  clickElement, dragAndDropElement, dragElement, dragStartElement, dropElement, triggerKeyboardEvent,
} from '../common/interaction';
import { convertScaleToMatrix, convertTranslate2dToMatrix } from '../common/utils';

describe('DiagramMaker.API', () => {
  beforeEach(() => {
    cy.visit('/LeftRightRectangular.html');
  });

  const toolsType = 'DiagramMaker.Tools';
  const viewport = { width: 1200, height: 900 };
  const nodeRect = {
    width: 100, height: 50, top: 150, left: 200,
  };
  const workspace = { width: 3200, height: 1600 };

  describe('setEditorMode', () => {
    describe('Select', () => {
      const selectId = 'Select';

      beforeEach(() => {
        getElementByDataIdAndType(selectId, toolsType).click();
      });

      it('displays a marquee when dragging on workspace', () => {
        dragStartElement(getWorkspace(), { pageX: 400, pageY: 400 });
        dragElement(getWorkspace(), { pageX: 600, pageY: 600 });
        getSelectionMarquee().should('have.length', 1);
        getSelectionMarquee().should('have.css', 'width').and('eq', '200px');
        getSelectionMarquee().should('have.css', 'height').and('eq', '200px');
        getSelectionMarquee().should('have.css', 'top').and('eq', '400px');
        getSelectionMarquee().should('have.css', 'left').and('eq', '400px');
      });

      it('selects the node(s) within the boundary', () => {
        dragStartElement(getWorkspace(), { pageX: 600, pageY: 600 });
        dragElement(getWorkspace(), { pageX: 300, pageY: 300 });
        getSelectionMarquee().should('have.length', 1);
        getNodeById('node2').children('.dm-content').children().should('have.class', 'selected');
        getNodeById('node1').children('.dm-content').children().should('not.have.class', 'selected');
        dragElement(getWorkspace(), { pageX: 100, pageY: 100 });
        getSelectionMarquee().should('have.length', 1);
        getNodeById('node2').children('.dm-content').children().should('have.class', 'selected');
        getNodeById('node1').children('.dm-content').children().should('have.class', 'selected');
      });

      it('selects the node(s) within the boundary after selection is stopped', () => {
        dragStartElement(getWorkspace(), { pageX: 600, pageY: 600 });
        dragElement(getWorkspace(), { pageX: 300, pageY: 300 });
        dropElement(getWorkspace());
        getSelectionMarquee().should('have.length', 0);
        getNodeById('node2').children('.dm-content').children().should('have.class', 'selected');
        getNodeById('node1').children('.dm-content').children().should('not.have.class', 'selected');
      });

      it('unselects the node(s) that goes outside the boundary', () => {
        dragStartElement(getWorkspace(), { pageX: 600, pageY: 600 });
        dragElement(getWorkspace(), { pageX: 300, pageY: 300 });
        getSelectionMarquee().should('have.length', 1);
        getNodeById('node2').children('.dm-content').children().should('have.class', 'selected');
        getNodeById('node1').children('.dm-content').children().should('not.have.class', 'selected');
        dragElement(getWorkspace(), { pageX: 500, pageY: 500 });
        getSelectionMarquee().should('have.length', 1);
        getNodeById('node2').children('.dm-content').children().should('not.have.class', 'selected');
        getNodeById('node1').children('.dm-content').children().should('not.have.class', 'selected');
      });
    });

    describe('ReadOnly', () => {
      const readOnlyId = 'ReadOnly';

      it('allows workspace dragging', () => {
        getElementByDataIdAndType(readOnlyId, toolsType).click();
        const originalTransform = convertTranslate2dToMatrix(0, 0);
        getWorkspace().should('have.css', 'transform').and('eq', originalTransform);
        dragStartElement(getWorkspace(), { pageX: 1500, pageY: 700 });
        const newTransform = convertTranslate2dToMatrix(-100, -100);
        getWorkspace().should('have.css', 'transform').and('eq', newTransform);
      });

      it('allows workspace resize', () => {
        getElementByDataIdAndType(readOnlyId, toolsType).click();
        getPanelById('library');
        const newViewport = { width: 1400, height: 900 };
        cy.viewport(newViewport.width, newViewport.height);
        const panelWidth = 250;
        const width = 1200;
        let expectedTransform = convertTranslate2dToMatrix(width - panelWidth - 20, 20);
        getPanelById('library').should('have.css', 'transform').and('eq', expectedTransform);
        getElementByDataIdAndType('UpdateContainer', 'DiagramMaker.Tools').click();
        expectedTransform = convertTranslate2dToMatrix(newViewport.width - panelWidth - 20, 20);
        getPanelById('library').should('have.css', 'transform').and('eq', expectedTransform);
      });

      it('allows workspace zooming', () => {
        getElementByDataIdAndType(readOnlyId, toolsType).click();
        const expectedTransform = convertScaleToMatrix(1.3);
        getWorkspace()
          .trigger('wheel', {
            deltaY: -50, pageX: 0, pageY: 0, force: true,
          });
        getWorkspace().should('have.css', 'transform').and('eq', expectedTransform);
      });

      it('doesnt allow node move', () => {
        getElementByDataIdAndType(readOnlyId, toolsType).click();
        const node = getNodeById('node1');
        dragStartElement(node, { pageX: 500, pageY: 500 });
        const expectedTransform = convertTranslate2dToMatrix(200, 150);
        node.should('have.css', 'transform').and('eq', expectedTransform);
      });

      it('doesnt allow node selection', () => {
        getElementByDataIdAndType(readOnlyId, toolsType).click();
        const node = getNodeById('node1');
        clickElement(node);
        const childElement = node.children('.dm-content').children();
        childElement.should('not.have.class', 'selected');
      });

      it('doesnt allow dragging of new nodes', () => {
        getElementByDataIdAndType(readOnlyId, toolsType).click();
        const node = getPotentialNodeById('testId-normal');
        dragStartElement(node, { pageX: 0, pageY: 0 });
        cy.get('.dm-interim .dm-potential-node').should('not.exist');
        dropElement(getPotentialNodeById('testId-normal').first());
        cy.get('.dm-interim .dm-potential-node').should('not.exist');
        getAllNodes().should('have.length', 2);
      });

      it('doesnt allow edge selection', () => {
        getElementByDataIdAndType(readOnlyId, toolsType).click();
        const edge = getEdgeById('edge1');
        clickElement(edge);
        edge.should('not.have.class', 'dm-selected');
      });

      it('doesnt allow edge creation', () => {
        getElementByDataIdAndType(readOnlyId, toolsType).click();
        getAllEdges().should('have.length', 1);

        const inputNode = getNodeById('node1');

        inputNode.children('.dm-connector-input').then((el) => {
          const rect = el[0].getBoundingClientRect();

          const x = rect.left + rect.width / 2;
          const y = rect.top + rect.height / 2;

          let outputNode = getNodeById('node2');
          let outputConnector = outputNode.children('.dm-connector-output');
          dragStartElement(outputConnector, { pageX: 0, pageY: 0 });
          getPotentialEdge().should('not.exist');

          outputNode = getNodeById('node2');
          outputConnector = outputNode.children('.dm-connector-output');
          dropElement(outputConnector, { pageX: x, pageY: y });
          getAllEdges().should('have.length', 1);
        });
      });

      it('doesnt allow select all', () => {
        getElementByDataIdAndType(readOnlyId, toolsType).click();
        triggerKeyboardEvent(getDiagramMakerView(), 'a', true);
        getAllNodes().children('.dm-content').children().should('not.have.class', 'selected');
      });

      it('doesnt allow delete node', () => {
        const node = getNodeById('node1');
        clickElement(node);
        getElementByDataIdAndType(readOnlyId, toolsType).click();
        triggerKeyboardEvent(getDiagramMakerView(), 'Delete');
        getNodeById('node1').should('exist');
      });

      it('doesnt allow delete edges', () => {
        const edge = getEdgeById('edge1');
        clickElement(edge);
        getElementByDataIdAndType(readOnlyId, toolsType).click();
        triggerKeyboardEvent(getDiagramMakerView(), 'Delete');
        getEdgeById('edge1').should('exist');
      });
    });
  });

  describe('focusNode', () => {
    const focusNodeId = 'FocusNode';
    it('centers node1', () => {
      const centerX = 1000;
      const centerY = 1000;
      const topLeftX = centerX - nodeRect.width / 2;
      const topLeftY = centerY - nodeRect.height / 2;
      const expectedNodeTransform = convertTranslate2dToMatrix(topLeftX, topLeftY);
      const node = getNodeById('node1');
      dragAndDropElement(node, { pageX: centerX, pageY: centerY });
      node.should('have.css', 'transform').and('eq', expectedNodeTransform);
      getElementByDataIdAndType(focusNodeId, toolsType).click();
      const expectedTransform = convertTranslate2dToMatrix(viewport.width / 2 - centerX, viewport.height / 2 - centerY);
      getWorkspace().should('have.css', 'transform').and('eq', expectedTransform);
    });

    it('centers node1 but doesnt go past the edge of the workspace', () => {
      const centerX = 1000;
      const centerY = 200;
      const topLeftX = centerX - nodeRect.width / 2;
      const topLeftY = centerY - nodeRect.height / 2;
      const expectedNodeTransform = convertTranslate2dToMatrix(topLeftX, topLeftY);
      const node = getNodeById('node1');
      dragAndDropElement(node, { pageX: centerX, pageY: centerY });
      node.should('have.css', 'transform').and('eq', expectedNodeTransform);
      getElementByDataIdAndType(focusNodeId, toolsType).click();
      const expectedX = Math.min(viewport.width / 2 - centerX, 0);
      const expectedY = Math.min(viewport.height / 2 - centerY, 0);
      const expectedTransform = convertTranslate2dToMatrix(expectedX, expectedY);
      getWorkspace().should('have.css', 'transform').and('eq', expectedTransform);
    });
  });

  describe('focusSelected', () => {
    const focusSelectedId = 'FocusSelected';
    describe('when nothing is selected', () => {
      it('centers the workspace & resets the zoom', () => {
        const expectedTransform = convertScaleToMatrix(1.3);
        getWorkspace()
          .trigger('wheel', {
            deltaY: -50, pageX: 0, pageY: 0, force: true,
          });
        getWorkspace().should('have.css', 'transform').and('eq', expectedTransform);
        getElementByDataIdAndType(focusSelectedId, toolsType).click();
        const expectedLeft = (viewport.width - workspace.width) / 2;
        const expectedTop = (viewport.height - workspace.height) / 2;
        const resetExpectedTransform = convertTranslate2dToMatrix(expectedLeft, expectedTop);
        getWorkspace().should('have.css', 'transform').and('eq', resetExpectedTransform);
      });
    });

    describe('when only 1 node is selected', () => {
      it('centers the selected node', () => {
        const centerX = 1000;
        const centerY = 1000;
        const topLeftX = centerX - nodeRect.width / 2;
        const topLeftY = centerY - nodeRect.height / 2;
        const expectedNodeTransform = convertTranslate2dToMatrix(topLeftX, topLeftY);
        const node = getNodeById('node1');
        clickElement(node);
        dragAndDropElement(node, { pageX: centerX, pageY: centerY });
        node.should('have.css', 'transform').and('eq', expectedNodeTransform);
        getElementByDataIdAndType(focusSelectedId, toolsType).click();
        const expectedTransform = convertTranslate2dToMatrix(
          viewport.width / 2 - centerX,
          viewport.height / 2 - centerY,
        );
        getWorkspace().should('have.css', 'transform').and('eq', expectedTransform);
      });
    });

    describe('when multiple nodes are selected', () => {
      beforeEach(() => {
        const selectId = 'Select';
        getElementByDataIdAndType(selectId, toolsType).click();
        dragStartElement(getWorkspace(), { pageX: 600, pageY: 600 });
        dragElement(getWorkspace(), { pageX: 100, pageY: 100 });
        dropElement(getWorkspace());
      });

      it('fits the selected nodes', () => {
        getElementByDataIdAndType(focusSelectedId, toolsType).click();
        const buffer = 50;
        const nodeBoundingRect = {
          width: 300, height: 200, top: 150, left: 200,
        };
        const nodeBoundingRectWithBuffer = {
          height: nodeBoundingRect.height + 2 * buffer,
          left: nodeBoundingRect.left - buffer,
          top: nodeBoundingRect.top - buffer,
          width: nodeBoundingRect.width + 2 * buffer,
        };
        const scaleForWidth = viewport.width / nodeBoundingRectWithBuffer.width;
        const scaleForHeight = viewport.height / nodeBoundingRectWithBuffer.height;
        const expectedScale = Math.min(scaleForWidth, scaleForHeight);
        const expectedPosition = {
          x: -nodeBoundingRectWithBuffer.left * expectedScale,
          y: -nodeBoundingRectWithBuffer.top * expectedScale,
        };
        const expectedTransform = convertScaleToMatrix(expectedScale, expectedPosition.x, expectedPosition.y);
        getWorkspace().should('have.css', 'transform').and('eq', expectedTransform);
      });
    });
  });

  describe('fit', () => {
    const fitId = 'Fit';
    it('fits all the nodes on the screen', () => {
      getElementByDataIdAndType(fitId, toolsType).click();
      const buffer = 50;
      const nodeBoundingRect = {
        width: 300, height: 200, top: 150, left: 200,
      };
      const nodeBoundingRectWithBuffer = {
        height: nodeBoundingRect.height + 2 * buffer,
        left: nodeBoundingRect.left - buffer,
        top: nodeBoundingRect.top - buffer,
        width: nodeBoundingRect.width + 2 * buffer,
      };
      const scaleForWidth = viewport.width / nodeBoundingRectWithBuffer.width;
      const scaleForHeight = viewport.height / nodeBoundingRectWithBuffer.height;
      const expectedScale = Math.min(scaleForWidth, scaleForHeight);
      const expectedPosition = {
        x: -nodeBoundingRectWithBuffer.left * expectedScale,
        y: -nodeBoundingRectWithBuffer.top * expectedScale,
      };
      const expectedTransform = convertScaleToMatrix(expectedScale, expectedPosition.x, expectedPosition.y);
      getWorkspace().should('have.css', 'transform').and('eq', expectedTransform);
    });
  });

  describe('zoom in', () => {
    const zoomInId = 'ZoomIn';
    it('zooms in the workspace based on center of the viewport', () => {
      getElementByDataIdAndType(zoomInId, toolsType).click();
      const zoomFactor = 0.3;
      const newZoom = 1 + zoomFactor;
      const viewportCenter = { x: viewport.width / 2, y: viewport.height / 2 };

      const x = Math.round(-1 * zoomFactor * viewportCenter.x);
      const y = Math.round(-1 * zoomFactor * viewportCenter.y);
      const expectedTransform = convertScaleToMatrix(newZoom, x, y);
      getWorkspace().should('have.css', 'transform').and('eq', expectedTransform);
    });
  });

  describe('zoom out', () => {
    const zoomOutId = 'ZoomOut';
    it('zooms out the workspace based on center of the viewport', () => {
      getElementByDataIdAndType(zoomOutId, toolsType).click();
      const zoomFactor = 0.3;
      const newZoom = 1 - zoomFactor;
      const viewportCenter = { x: viewport.width / 2, y: viewport.height / 2 };

      const x = Math.round(zoomFactor * viewportCenter.x);
      const y = Math.round(zoomFactor * viewportCenter.y);
      const expectedTransform = convertScaleToMatrix(newZoom, Math.min(x, 0), Math.min(y, 0));
      getWorkspace().should('have.css', 'transform').and('eq', expectedTransform);
    });
  });

  describe('reset zoom', () => {
    const zoomOutId = 'ZoomOut';
    const resetZoomId = 'ResetZoom';
    it('resets the zooms based on center of the viewport', () => {
      getElementByDataIdAndType(zoomOutId, toolsType).click();
      const zoomFactor = 0.3;
      const newZoom = 1 - zoomFactor;
      const expectedZoomedTransform = convertScaleToMatrix(newZoom);
      getWorkspace().should('have.css', 'transform').and('eq', expectedZoomedTransform);
      getElementByDataIdAndType(resetZoomId, toolsType).click();
      const expectedLeft = (viewport.width - workspace.width) / 2;
      const expectedTop = (viewport.height - workspace.height) / 2;
      const resetExpectedTransform = convertTranslate2dToMatrix(expectedLeft, expectedTop);
      getWorkspace().should('have.css', 'transform').and('eq', resetExpectedTransform);
    });
  });

  describe('undo', () => {
    const undoId = 'Undo';

    it('undoes the last create node action', () => {
      getAllNodes().should('have.length', 2);
      const node = getPotentialNodeById('testId-normal');
      dragAndDropElement(node, { pageX: 0, pageY: 0 });
      getAllNodes().should('have.length', 3);
      getElementByDataIdAndType(undoId, toolsType).click();
      getAllNodes().should('have.length', 2);
    });

    it('undoes the last delete node action', () => {
      getAllNodes().should('have.length', 2);
      const node = getNodeById('node1');
      clickElement(node);
      triggerKeyboardEvent(getDiagramMakerView(), 'Delete');
      getAllNodes().should('have.length', 1);
      getElementByDataIdAndType(undoId, toolsType).click();
      getAllNodes().should('have.length', 2);
    });

    it('undoes the last create edge action', () => {
      getAllEdges().should('have.length', 1);

      const inputNode = getNodeById('node1');

      inputNode.children('.dm-connector-input').then((el) => {
        const rect = el[0].getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        const outputNode = getNodeById('node2');
        const outputConnector = outputNode.children('.dm-connector-output');
        dragAndDropElement(outputConnector, { pageX: x, pageY: y });
        getAllEdges().should('have.length', 2);
        getElementByDataIdAndType(undoId, toolsType).click();
        getAllEdges().should('have.length', 1);
      });
    });

    it('undoes the last delete edge action', () => {
      getAllEdges().should('have.length', 1);
      const edge = getEdgeById('edge1');
      clickElement(edge);
      triggerKeyboardEvent(getDiagramMakerView(), 'Delete');
      getAllEdges().should('have.length', 0);
      getElementByDataIdAndType(undoId, toolsType).click();
      getAllEdges().should('have.length', 1);
    });

    it('doesnt undo the last move node action', () => {
      const centerX = 500;
      const centerY = 500;
      const topLeftX = centerX - nodeRect.width / 2;
      const topLeftY = centerY - nodeRect.height / 2;
      const expectedBeforeTransform = convertTranslate2dToMatrix(nodeRect.left, nodeRect.top);
      const expectedTransform = convertTranslate2dToMatrix(topLeftX, topLeftY);
      getNodeById('node1').should('have.css', 'transform').and('eq', expectedBeforeTransform);
      dragAndDropElement(getNodeById('node1'), { pageX: centerX, pageY: centerY });
      getNodeById('node1').should('have.css', 'transform').and('eq', expectedTransform);
      getElementByDataIdAndType(undoId, toolsType).click();
      getNodeById('node1').should('have.css', 'transform').and('eq', expectedTransform);
    });

    it('doesnt undo the last workspace move action', () => {
      const originalTransform = convertTranslate2dToMatrix(0, 0);
      getWorkspace().should('have.css', 'transform').and('eq', originalTransform);
      dragStartElement(getWorkspace(), { pageX: 400, pageY: 400 }, { pageX: 500, pageY: 500 });
      dropElement(getWorkspace(), { pageX: 400, pageY: 400 });
      const newTransform = convertTranslate2dToMatrix(-100, -100);
      getWorkspace().should('have.css', 'transform').and('eq', newTransform);
      getElementByDataIdAndType(undoId, toolsType).click();
      getWorkspace().should('have.css', 'transform').and('eq', newTransform);
    });

    it('doesnt undo if nothing was done', () => {
      getAllNodes().should('have.length', 2);
      getAllEdges().should('have.length', 1);
      const originalTransform = convertTranslate2dToMatrix(0, 0);
      getWorkspace().should('have.css', 'transform').and('eq', originalTransform);
      getElementByDataIdAndType(undoId, toolsType).click();
      getAllNodes().should('have.length', 2);
      getAllEdges().should('have.length', 1);
      getWorkspace().should('have.css', 'transform').and('eq', originalTransform);
    });
  });

  describe('redo', () => {
    const undoId = 'Undo';
    const redoId = 'Redo';

    it('redoes the last undone action', () => {
      getAllNodes().should('have.length', 2);
      const node = getPotentialNodeById('testId-normal');
      dragAndDropElement(node, { pageX: 0, pageY: 0 });
      getAllNodes().should('have.length', 3);
      getElementByDataIdAndType(undoId, toolsType).click();
      getAllNodes().should('have.length', 2);
      getElementByDataIdAndType(redoId, toolsType).click();
      getAllNodes().should('have.length', 3);
    });

    it('doesnt redo if nothing was undone', () => {
      getAllNodes().should('have.length', 2);
      const node = getPotentialNodeById('testId-normal');
      dragAndDropElement(node, { pageX: 0, pageY: 0 });
      getAllNodes().should('have.length', 3);
      getElementByDataIdAndType(redoId, toolsType).click();
      getAllNodes().should('have.length', 3);
    });
  });
});
