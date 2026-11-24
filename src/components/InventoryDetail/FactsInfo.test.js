import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import FactsInfo from './FactsInfo';

jest.mock('../../Utilities/useFeatureFlag');
jest.mock('@redhat-cloud-services/frontend-components/CullingInfo', () => {
  const PropTypes = require('prop-types');
  const CullingInformation = ({ culled, children }) => (
    <div data-testid="culling-information" data-culled={culled}>
      {children}
    </div>
  );

  CullingInformation.propTypes = {
    culled: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.instanceOf(Date),
    ]),
    children: PropTypes.node,
  };

  return { CullingInformation };
});

describe('FactsInfo', () => {
  it('should render extra label for CentOS system', () => {
    render(
      <FactsInfo
        loaded
        entity={{
          system_profile: {
            operating_system: {
              name: 'CentOS Linux',
            },
          },
        }}
      />,
    );

    expect(screen.getByText(/centos linux/i)).toBeVisible();
  });

  it('uses the deletion timestamp for culling information', () => {
    const deletionTimestamp = '2026-11-24T12:00:00.000Z';

    render(
      <FactsInfo
        loaded
        entity={{
          deletion_timestamp: deletionTimestamp,
          last_check_in: '2026-11-23T12:00:00.000Z',
        }}
      />,
    );

    expect(screen.getByTestId('culling-information')).toHaveAttribute(
      'data-culled',
      deletionTimestamp,
    );
  });
});
