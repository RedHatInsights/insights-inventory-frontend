import React from 'react';
import Fallback from './SpinnerFallback';
import { mount } from 'cypress/react';

describe('SpinnerFallback tests', () => {
  it('renders correctly', () => {
    mount(<Fallback />);
    cy.get('.pf-v6-l-bullseye').find('.pf-v6-c-spinner');
  });
});
