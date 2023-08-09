import { GroupDetailInfo } from './GroupDetailInfo';

const mountPage = (params) =>
  cy.mountWithContext(GroupDetailInfo, undefined, params);

describe('group detail information page', () => {
  before(() => {
    cy.mockWindowChrome({ userPermissions: ['rbac:*:*'] });
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

  it('link is present', () => {
    cy.get('div[class="pf-c-card__body"] a')
      .should('have.length', 1)
      .and('have.text', 'Identity & Access Management > User Access');
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

  describe('with no user access administrator role', () => {
    beforeEach(() => {
      cy.mockWindowChrome({ userPermissions: [] });
      mountPage({ chrome: { isBeta: () => true } });
    });

    it('button disabled if not enough permissions', () => {
      cy.get('a')
        .contains('Manage access')
        .should('have.attr', 'aria-disabled', 'true');
    });

    it('card text is present', () => {
      cy.get('div[class="pf-c-card__body"] a').should('not.exist');
    });
  });
});
