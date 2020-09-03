import {
  getAllEdges, getAllNodes, getDiagramMakerView, getEdgeById, getElementByDataIdAndType, getNodeById, getWorkspace
} from '../common/getters';
import { clickElement, dragStartElement, dropElement, triggerKeyboardEvent } from '../common/interaction';
import { convertScaleToMatrix, convertTranslate2dToMatrix } from '../common/utils';

describe('DiagramMaker.Workspace', () => {

  const workspace = { width: 3200, height: 1600 };
  const viewport = { width: 1200, height: 900 };

  beforeEach(() => {
    cy.visit('/LeftRightRectangular.html');
  });

  describe('workspace rendering', () => {
    it('renders the workspace, canvas & dots inside it', () => {
      cy.get('.dm-workspace .dm-canvas .dm-dots').should('exist');
    });
  });

  describe('drag workspace', () => {
    it('moves the workspace around', () => {
      const originalTransform = convertTranslate2dToMatrix(0, 0);
      getWorkspace().should('have.css', 'transform').and('eq', originalTransform);
      dragStartElement(getWorkspace(), { pageX: 400, pageY: 400 }, { pageX: 500, pageY: 500 });
      const newTransform = convertTranslate2dToMatrix(-100, -100);
      getWorkspace().should('have.css', 'transform').and('eq', newTransform);
    });

    it('doesnt move beyond the top left corner', () => {
      const originalTransform = convertTranslate2dToMatrix(0, 0);
      getWorkspace().should('have.css', 'transform').and('eq', originalTransform);
      dragStartElement(getWorkspace(), { pageX: 500, pageY: 500 }, { pageX: 400, pageY: 400 });
      getWorkspace().should('have.css', 'transform').and('eq', originalTransform);
    });

    it('doesnt move beyond the bottom right corner', () => {
      const originalTransform = convertTranslate2dToMatrix(0, 0);
      getWorkspace().should('have.css', 'transform').and('eq', originalTransform);
      dragStartElement(getWorkspace(), { pageX: 0, pageY: 0 }, { pageX: 600, pageY: 600 });
      dropElement(getWorkspace(), { pageX: 0, pageY: 0 });
      let newTransform = convertTranslate2dToMatrix(-600, -600);
      getWorkspace().should('have.css', 'transform').and('eq', newTransform);
      dragStartElement(getWorkspace(), { pageX: 0, pageY: 0 }, { pageX: 600, pageY: 600 });
      dropElement(getWorkspace(), { pageX: 0, pageY: 0 });
      // will not go beyond -700 since viewport is 900px wide & workspace height is 1600
      newTransform = convertTranslate2dToMatrix(-1200, -700);
      getWorkspace().should('have.css', 'transform').and('eq', newTransform);
    });
  });

  describe('zoom workspace', () => {
    it('zooms in the workspace when user scrolls mouse wheel down on the workspace', () => {
      const expectedTransform = convertScaleToMatrix(1.3);
      getWorkspace()
        .trigger('wheel', { deltaY: -50, pageX: 0, pageY: 0, force: true });
      getWorkspace().should('have.css', 'transform').and('eq', expectedTransform);
    });

    it('zooms out the workspace when user scrolls mouse wheel up on the workspace', () => {
      const expectedTransform = convertScaleToMatrix(0.7);
      getWorkspace()
        .trigger('wheel', { deltaY: 50, pageX: 0, pageY: 0, force: true });
      getWorkspace().should('have.css', 'transform').and('eq', expectedTransform);
    });

    it('doesnt zoom in beyond max zoom', () => {
      const maxScale = 3;
      const expectedTransform = convertScaleToMatrix(maxScale);
      getWorkspace()
        .trigger('wheel', { deltaY: -500, pageX: 0, pageY: 0, force: true });
      getWorkspace().should('have.css', 'transform').and('eq', expectedTransform);
    });

    it('doesnt zoom out beyond min zoom based on viewport & workspace size', () => {
      const scaleForWidth = viewport.width / workspace.width;
      const scaleForHeight = viewport.height / workspace.height;
      const excpectedScale = Math.max(scaleForHeight, scaleForWidth);
      const expectedTransform = convertScaleToMatrix(excpectedScale);
      getWorkspace()
        .trigger('wheel', { deltaY: 500, pageX: 0, pageY: 0, force: true });
      getWorkspace().should('have.css', 'transform').and('eq', expectedTransform);
    });

    it('doesnt zoom out beyond min zoom', () => {
      const newViewport = { width: 400, height: 300 };
      cy.viewport(newViewport.width, newViewport.height);
      getElementByDataIdAndType('UpdateContainer', 'DiagramMaker.Tools').click();
      const minScale = 0.3;
      const expectedTransform = convertScaleToMatrix(minScale);
      getWorkspace()
        .trigger('wheel', { deltaY: 500, pageX: 0, pageY: 0, force: true });
      getWorkspace().should('have.css', 'transform').and('eq', expectedTransform);
    });
  });

  describe('select all', () => {
    it('selects all when command & A are pressed', () => {
      triggerKeyboardEvent(getDiagramMakerView(), 'a', true);
      getAllNodes().children('.dm-content').children().should('have.class', 'selected');
    });

    it('selects all even if some are already selected', () => {
      const node = getNodeById('node1');
      clickElement(node);
      const childElement = node.children('.dm-content').children();
      childElement.should('have.class', 'selected');
      triggerKeyboardEvent(getDiagramMakerView(), 'a', true);
      getAllNodes().children('.dm-content').children().should('have.class', 'selected');
    });
  });

  describe('deselect all', () => {
    it('deselects all when workspace is clicked & all nodes are selected', () => {
      triggerKeyboardEvent(getDiagramMakerView(), 'a', true);
      getAllNodes().children('.dm-content').children().should('have.class', 'selected');
      clickElement(getWorkspace());
      getAllNodes().children('.dm-content').children().should('not.have.class', 'selected');
    });

    it('deselects all when workspace is clicked & some nodes are selected', () => {
      const node = getNodeById('node1');
      clickElement(node);
      const childElement = node.children('.dm-content').children();
      childElement.should('have.class', 'selected');
      clickElement(getWorkspace());
      getAllNodes().children('.dm-content').children().should('not.have.class', 'selected');
    });

    it('deselects all when workspace is clicked & edge is selected', () => {
      const edge = getEdgeById('edge1');
      clickElement(edge);
      edge.should('have.class', 'dm-selected');
      clickElement(getWorkspace());
      getAllEdges().should('not.have.class', 'selected');
    });

    it('deselects all when workspace is clicked & nodes & edge is selected', () => {
      const edge = getEdgeById('edge1');
      clickElement(edge);
      triggerKeyboardEvent(getDiagramMakerView(), 'a', true);
      getAllNodes().children('.dm-content').children().should('have.class', 'selected');
      getEdgeById('edge1').should('have.class', 'dm-selected');
      clickElement(getWorkspace());
      getAllEdges().should('not.have.class', 'selected');
      getAllNodes().children('.dm-content').children().should('not.have.class', 'selected');
    });
  });

  describe('delete items', () => {
    it('deletes multiple nodes & connected edges when they are selected', () => {
      triggerKeyboardEvent(getDiagramMakerView(), 'a', true);
      getAllNodes().children('.dm-content').children().should('have.class', 'selected');
      triggerKeyboardEvent(getDiagramMakerView(), 'Delete');
      getAllNodes().should('not.exist');
      getEdgeById('edge1').should('not.exist');
    });

    it('deletes multiple nodes & edges when they are selected', () => {
      const edge = getEdgeById('edge1');
      clickElement(edge);
      triggerKeyboardEvent(getDiagramMakerView(), 'a', true);
      getAllNodes().children('.dm-content').children().should('have.class', 'selected');
      getEdgeById('edge1').should('have.class', 'dm-selected');
      triggerKeyboardEvent(getDiagramMakerView(), 'Delete');
      getAllNodes().should('not.exist');
      getEdgeById('edge1').should('not.exist');
    });

    it('deletes node & edge when they are selected', () => {
      const edge = getEdgeById('edge1');
      clickElement(edge);
      // using focus node api to select a single node & edge together
      // selecting a node or an edge by clicking deselects the other
      getElementByDataIdAndType('FocusNode', 'DiagramMaker.Tools').click();
      getNodeById('node1').children('.dm-content').children().should('have.class', 'selected');
      getEdgeById('edge1').should('have.class', 'dm-selected');
      triggerKeyboardEvent(getDiagramMakerView(), 'Delete');
      getNodeById('node1').should('not.exist');
      getEdgeById('edge1').should('not.exist');
    });

    it('doesnt delete if focus is on input within diagram maker', () => {
      triggerKeyboardEvent(getDiagramMakerView(), 'a', true);
      getAllNodes().children('.dm-content').children().should('have.class', 'selected');
      triggerKeyboardEvent(getElementByDataIdAndType('TestInput', 'DiagramMaker.Tools'), 'Delete');
      getAllNodes().should('exist');
      getEdgeById('edge1').should('exist');
    });
  });
});
