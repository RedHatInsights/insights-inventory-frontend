import React from 'react';
import Fallback from './SpinnerFallback';
import { mount } from '@cypress/react';

describe('SpinnerFallback tests', () => {
    it('renders correctly', () => {
        mount(<Fallback />);
        cy.get('.pf-l-bullseye').find('.pf-c-spinner');
    });
});
