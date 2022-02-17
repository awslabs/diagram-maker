import {
  getElementByType,
  getWorkspace,
} from '../common/getters';
import { clickElement } from '../common/interaction';
import { convertTranslate2dToMatrix } from '../common/utils';

describe('DiagramMakerPlugin', () => {
  beforeEach(() => {
    cy.visit('/iframe.html?id=demos-diagram-maker--plugins&args=&viewMode=story');
  });

  describe('render testPlugin', () => {
    it('has correct size', () => {
      const testPlugin = getElementByType('testPlugin');
      testPlugin.should('have.css', 'height', '50px');
      testPlugin.should('have.css', 'width', '200px');
    });
  });

  describe('click testPlugin', () => {
    it('change workspace position when click on testPlugin', () => {
      clickElement(getElementByType('testPlugin'));
      const expectedTransform = convertTranslate2dToMatrix(-100, -100);
      getWorkspace().should('have.css', 'transform').and('eq', expectedTransform);
    });
  });
});
