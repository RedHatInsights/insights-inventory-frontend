import React from 'react';
import { Route, Routes } from 'react-router-dom';
import ImmutableDevices from './ImmutableDevices';
import {
  featureFlagsInterceptors,
  hostsInterceptors,
} from '../../../cypress/support/interceptors';
import { DropdownItem } from '@patternfly/react-core/deprecated';
import {
  PT_CONDITIONAL_FILTER_LIST,
  DROPDOWN_ITEM,
  MENU_ITEM,
  MENU_TOGGLE,
  TABLE_ROW,
} from '@redhat-cloud-services/frontend-components-utilities';

const defaultProps = {
  mergeAppColumns: (columns) => columns,
};

// eslint-disable-next-line react/prop-types
const MockRouter = ({ path = '/insights/inventory', ...props }) => (
  <Routes>
    <Route path={path} element={<ImmutableDevices {...props} />} />
    <Route
      path={'/insights/image-builder/manage-edge-images/00000'}
      element={<div id="mock-image-detail-page">Image detail</div>}
    />
    <Route
      path={'*'}
      element={<div id="mock-detail-page">Device detail</div>}
    />
  </Routes>
);

const getEntities =
  (dataInject) => async (items, config, showTags, defaultGetEntities) => {
    const result = await defaultGetEntities(items, config, showTags);
    result.results.map(dataInject);
    return result;
  };

const mountWithProps = (props) => {
  return cy.mountWithContext(
    MockRouter,
    {
      routerProps: { initialEntries: ['/insights/inventory'] },
    },
    props,
  );
};

before(() => {
  cy.mockWindowInsights();
});

describe('ImmutableDevices', () => {
  beforeEach(() => {
    cy.intercept('*', { statusCode: 200, body: { results: [] } });
    hostsInterceptors.successful();
    featureFlagsInterceptors.edgeParitySuccessful();
  });

  it('renders without issues', () => {
    mountWithProps(defaultProps);

    cy.get('table[aria-label="Host inventory"]').should('be.visible');
  });

  it('Should populate Image column from useGetEntities', () => {
    defaultProps.getEntities = async (
      items,
      config,
      showTags,
      defaultGetEntities,
    ) => {
      const result = await defaultGetEntities(items, config, showTags);
      result.results.map(
        (row, index) => (row.ImageName = `Test-image-${index}`),
      );
      return result;
    };

    mountWithProps(defaultProps);

    cy.get('td[data-label="Image"] > a').contains('Test-image-0');
  });

  describe('Status column', () => {
    it('Should populate Status column with Unknown by default', () => {
      defaultProps.getEntities = getEntities((row) => row);

      mountWithProps(defaultProps);

      cy.get('td[data-label="Status"] > #status > :nth-child(2) > p').contains(
        'Unknown',
      );
    });

    it('Should populate Status column with Update available', () => {
      defaultProps.getEntities = getEntities((row) => {
        row.UpdateAvailable = true;
        return row;
      });

      mountWithProps(defaultProps);

      cy.get('td[data-label="Status"] > #status > :nth-child(2) > p').contains(
        'Update available',
      );
    });

    it('Should populate Status column with Unresponsive', () => {
      defaultProps.getEntities = getEntities((row) => {
        row.DispatcherStatus = 'UNRESPONSIVE';
        return row;
      });

      mountWithProps(defaultProps);

      cy.get('td[data-label="Status"] > #status > :nth-child(2) > p').contains(
        'Unresponsive',
      );
    });

    it('Should populate Status column with Updating', () => {
      defaultProps.getEntities = getEntities((row) => {
        row.Status = 'UPDATING';
        return row;
      });

      mountWithProps(defaultProps);

      cy.get('td[data-label="Status"] > #status > :nth-child(2) > p').contains(
        'Updating',
      );
    });

    it('Should populate Status column with Error', () => {
      defaultProps.getEntities = getEntities((row) => {
        row.DispatcherStatus = 'ERROR';
        return row;
      });

      mountWithProps(defaultProps);

      cy.get('td[data-label="Status"] > #status > :nth-child(2) > p').contains(
        'Error',
      );
    });
  });

  it("Should add consumers' custom columns", () => {
    const mergeAppColumns = (defaultColumns) => {
      const consumerSpecificColumn = {
        key: 'testColumn',
        title: 'Test-column',
        props: { isStatic: true },
      };

      return [...defaultColumns, consumerSpecificColumn];
    };

    const getEntitiesProp = getEntities((row) => {
      row.testColumn = 'Test-column-value';
      return row;
    });

    mountWithProps({ mergeAppColumns, getEntities: getEntitiesProp });

    cy.get('thead > tr > [data-label="Test-column"]');
    cy.get(TABLE_ROW)
      .eq(0)
      .find('[data-label="Test-column"]')
      .should('have.text', 'Test-column-value'); // TODO: return to OUIA-based selectors
  });

  it('Should take to details page on system name click', () => {
    mountWithProps(defaultProps);

    cy.get('table[aria-label="Host inventory"]').should('be.visible');

    cy.get('td[data-label="Name"]').first().find('.ins-composed-col a').click();

    cy.get('#mock-detail-page');
  });

  it('Should take to image details page in image-builder app on system name click', () => {
    const getEntitiesProp = getEntities((row, index) => {
      row.ImageName = `Test-image-${index}`;
      row.ImageSetID = '00000';
      return row;
    });

    mountWithProps({ ...defaultProps, getEntities: getEntitiesProp });

    cy.get('table[aria-label="Host inventory"]').should('be.visible');

    cy.get('a[aria-label="image-name-link"]').first().click();
    cy.get('#mock-image-detail-page');
  });

  it('Should render actions in the table toolbar', () => {
    const actions = [
      {
        label: 'mock-toolbar-action',
      },
    ];

    mountWithProps({ ...defaultProps, actionsConfig: { actions } });

    cy.get('.ins-c-primary-toolbar__first-action > .pf-v5-c-button').should(
      'be.visible',
    );
  });

  it('Should render tags filter when showTags is set and hideFilters has it opened', () => {
    const hideFilters = { all: true, name: false, tags: false };

    mountWithProps({ ...defaultProps, hideFilters });

    cy.get('[aria-label="Conditional filter toggle"]').click(); // TODO: return to OUIA-based selectors
    cy.get(PT_CONDITIONAL_FILTER_LIST).find(DROPDOWN_ITEM).contains('Tags');
  });

  it('Should render table actions through the prop', () => {
    const tableActions = () => [
      {
        title: (
          <DropdownItem aria-label="Mock table action" key={'moock-button'}>
            mock table action
          </DropdownItem>
        ),
      },
    ];
    mountWithProps({ ...defaultProps, tableActions });

    cy.get(TABLE_ROW).first().find(MENU_TOGGLE).click();
    cy.get(MENU_ITEM).contains('mock table action').should('be.visible');
  });
});
