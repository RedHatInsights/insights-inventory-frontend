import React from 'react';
import Fallback from './SpinnerFallback';
import { mount } from '@cypress/react18';

describe('SpinnerFallback tests', () => {
  it('renders correctly', () => {
    mount(<Fallback />);
    cy.get('.pf-v5-l-bullseye').find('.pf-v5-c-spinner');
  });
});
