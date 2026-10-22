import { EMPTY_STATE_ICON } from '@redhat-cloud-services/frontend-components-utilities';
import { activationKeysInterceptors } from '../../../../../cypress/support/interceptors';
import SuccessPage from './SuccessPage';

const CHECKMARK_SVG =
  'M504 256c0 136.967-111.033 248-248 248S8 392.967 8 256 119.033 8 256 8s248 111.033 248 248zM227.314 387.314l184-184c6.248-6.248 6.248-16.379 0-22.627l-22.627-22.627c-6.248-6.249-16.379-6.249-22.628 0L216 308.118l-70.059-70.059c-6.248-6.248-16.379-6.248-22.628 0l-22.627 22.627c-6.248 6.248-6.248 16.379 0 22.627l104 104c6.249 6.249 16.379 6.249 22.628.001z';

describe('Rendering tests.', () => {
  beforeEach(() => {
    cy.mockWindowInsights();
    activationKeysInterceptors['successful with one key']();
    cy.mountWithContext(SuccessPage);
  });
  it('Success page renders correctly', () => {
    // close button displayed
    cy.get('button').should('include.text', 'Close');
    // correct icon displayed
    cy.get(EMPTY_STATE_ICON)
      .find('path')
      .should('have.attr', 'd', CHECKMARK_SVG);
  });
});
