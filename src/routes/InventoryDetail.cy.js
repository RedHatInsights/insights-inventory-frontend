import {
    featureFlagsInterceptors,
    hostsDetailInterceptors,
    systemProfileInterceptors,
    hostsDetailTagsInterceptors
} from '../../cypress/support/interceptors';
import InventoryDetail from './InventoryDetail';
import { routes } from '../Routes';

const mountWithProps = (options, props = {}) => {
    cy.mountWithContext(InventoryDetail, options, props);
};

before(() => {
    cy.mockWindowChrome();
});

describe('with default parameters', () => {
    beforeEach(() => {
        featureFlagsInterceptors.successful();
        systemProfileInterceptors['full system profile, successful with response']();
        hostsDetailInterceptors.successful();
        hostsDetailTagsInterceptors.successful();

        mountWithProps({ path: routes.detail, routerProps: { initialEntries: ['/host/test-host-id'] } });
    });

    describe('renders correctly', () => {
        it('renders main components for edge host', () => {
            cy.get('.ins-entity-detail').should('have.length', 1);

            cy.get('[data-cy="patch-tab"]').parent('.pf-c-tabs__item.pf-m-disabled').should('have.length', 1);
            cy.get('[data-cy="compliance-tab"]').parent('.pf-c-tabs__item.pf-m-disabled').should('have.length', 1);

            cy.get('[data-cy="vulnerabilities-tab"]').parent('.pf-c-tabs__item').click();
            cy.get('[data-cy="vulnerability-edge-prompt"]').should('have.length', 1);
            //TODO: add more checks other for handling edge hosts
        });
    });
});
