import { usePermissionsWithContext } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { TestWrapper } from '../../../Utilities/TestingUtilities';
import { getStore } from '../../../store';
import InventoryGroupDetail from '../InventoryGroupDetail';

jest.mock('../../../Utilities/useFeatureFlag');
jest.mock('@redhat-cloud-services/frontend-components-utilities/RBACHook');

describe('group detail page component', () => {
  usePermissionsWithContext.mockImplementation(() => ({ hasAccess: true }));

  it('renders two tabs', () => {
    render(
      <TestWrapper store={getStore()}>
        <InventoryGroupDetail groupId="group-id-2" />
      </TestWrapper>
    );

    screen.getByRole('tab', {
      name: /group systems tab/i,
    });
    screen.getByRole('tab', {
      name: /group info tab/i,
    });
  });
});
