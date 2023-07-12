import { GroupDetailInfo } from './GroupDetailInfo';

const mountPage = (params) =>
  cy.mountWithContext(GroupDetailInfo, undefined, params);

describe('group detail information page', () => {
  before(() => {
    cy.mockWindowChrome();
  });

  beforeEach(() => {
    mountPage({ chrome: { isBeta: () => false } });
  });

  it('title is rendered', () => {
    cy.get(
      'div[class="pf-c-card__title pf-c-title pf-m-lg card-title"]'
    ).should('have.text', 'User access configuration');
  });

  it('button is present', () => {
    cy.get('a').contains('Manage access').should('exist');
  });

  it('card text is present', () => {
    cy.get('div[class="pf-c-card__body"]').should(
      'have.text',
      'Manage your inventory group user access configuration under Identity & Access Management > User Access.'
    );
  });

  describe('links', () => {
    it('in stable environment', () => {
      mountPage({ chrome: { isBeta: () => false } });
      cy.get('a').should('have.attr', 'href', '/iam/user-access');
    });

    it('in beta environment', () => {
      mountPage({ chrome: { isBeta: () => true } });
      cy.get('a').should('have.attr', 'href', '/preview/iam/user-access');
    });
  });

  it('button disabled if not enough permissions', () => {
    cy.mockWindowChrome({ userPermissions: [] });
    mountPage({ chrome: { isBeta: () => true } });

    cy.get('button')
      .contains('Manage access')
      .should('have.attr', 'aria-disabled', 'true');
  });
});
