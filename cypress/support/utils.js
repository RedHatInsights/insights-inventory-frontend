export const ORDER_TO_URL = {
  ascending: 'ASC',
  descending: 'DESC',
};

export const checkSelectedNumber = (number, selector = '#toggle-checkbox') => {
  if (number === 0) {
    cy.get(selector).should('not.exist');
  } else {
    cy.get(selector).should('have.text', `${number} selected`);
  }
};

export const unleashDummyConfig = {
  url: 'http://localhost:8002/feature_flags',
  clientKey: 'abc',
  appName: 'abc',
};
