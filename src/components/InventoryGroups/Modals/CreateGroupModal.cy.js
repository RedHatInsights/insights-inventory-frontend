import React from 'react';
import { mount } from 'cypress/react';
import CreateGroupModal from './CreateGroupModal';
import { TEXT_INPUT } from '@redhat-cloud-services/frontend-components-utilities';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { getStore } from '../../../store';
import { featureFlagsInterceptors } from '../../../../cypress/support/interceptors';
import FlagProvider from '@unleash/proxy-client-react';

const mockResponse = [
  {
    count: 50,
    page: 20,
    per_page: 20,
    total: 50,
    results: [
      {
        created_at: '2020-02-09T10:16:07.996Z',
        host_count: 1,
        id: '3f01b55457674041b75e41829bcee1dca',
        name: 'sre-group0',
        updated_at: '2020-02-09T10:16:07.996Z',
      },
      {
        created_at: '2020-02-09T10:16:07.996Z',
        host_count: 1,
        id: '3f01b55457674041b75e41829bcee1dca',
        name: 'sre-group1',
        updated_at: '2020-02-09T10:16:07.996Z',
      },
      {
        created_at: '2020-02-09T10:16:07.996Z',
        host_count: 1,
        id: '3f01b55457674041b75e41829bcee1dca',
        name: 'sre-group2',
        updated_at: '2020-02-09T10:16:07.996Z',
      },
      {
        created_at: '2020-02-09T10:16:07.996Z',
        host_count: 1,
        id: '3f01b55457674041b75e41829bcee1dca',
        name: 'sre-group3',
        updated_at: '2020-02-09T10:16:07.996Z',
      },
    ],
  },
];

describe('Create Group Modal', () => {
  before(() => {
    cy.mockWindowInsights();
  });

  beforeEach(() => {
    cy.intercept('POST', '**/api/inventory/v1/groups', {
      statusCode: 504,
    }).as('create_group');
    cy.intercept('GET', '**/api/inventory/v1/groups', {
      statusCode: 200,
      body: {
        ...mockResponse,
      },
    }).as('validate');

    featureFlagsInterceptors.successful();

    mount(
      <FlagProvider
        config={{
          url: 'http://localhost:8002/feature_flags',
          clientKey: 'abc',
          appName: 'abc',
        }}
      >
        <MemoryRouter>
          <Provider store={getStore()}>
            <CreateGroupModal
              isModalOpen={true}
              reloadData={() => console.log('data reloaded')}
            />
          </Provider>
        </MemoryRouter>
      </FlagProvider>,
    );
  });

  it('Input is fillable and firing a validation request that succeeds', () => {
    cy.get(TEXT_INPUT).type('sre-group0');
    cy.wait('@validate').then((xhr) => {
      expect(xhr.request.url).to.contain('groups');
    });
    cy.get(`button[type="submit"]`).should(
      'have.attr',
      'aria-disabled',
      'true',
    );
  });
});
