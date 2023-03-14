import { ROW } from '@redhat-cloud-services/frontend-components-utilities';

export const ORDER_TO_URL = {
    ascending: 'ASC',
    descending: 'DESC'
};

export const selectRowN = (number) => {
    cy.get(ROW).eq(number).find('.pf-c-table__check').click();
};

export const checkSelectedNumber = (number, selector = '#toggle-checkbox-text') => {
    if (number === 0) {
        cy.get(selector).should('not.exist');
    } else {
        cy.get(selector).should('have.text', `${number} selected`);
    }
};

export const unleashDummyConfig = {
    url: 'http://localhost:8002/feature_flags',
    clientKey: 'abc',
    appName: 'abc'
};
