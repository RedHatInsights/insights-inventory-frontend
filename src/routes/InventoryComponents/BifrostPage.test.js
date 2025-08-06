import React from 'react';
import { render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useAxiosWithPlatformInterceptors } from '@redhat-cloud-services/frontend-components-utilities/interceptors';
import BifrostPage from './BifrostPage';
import mockedBootCStatusData from '../../__mocks__/mockedBootCStatusData.json';
import {
  INVENTORY_TOTAL_FETCH_URL_SERVER,
  INVENTORY_FETCH_BOOTC,
  INVENTORY_PACKAGE_BASED_SYSTEMS,
} from '../../Utilities/constants';

jest.mock('@redhat-cloud-services/frontend-components-utilities/interceptors');
jest.mock('../../Utilities/useFeatureFlag');

describe('BifrostPage', () => {
  const axiosMock = jest.fn(async () => mockedBootCStatusData);

  beforeEach(() => {
    useAxiosWithPlatformInterceptors.mockImplementation(() => ({
      get: axiosMock,
    }));
  });

  test('should fetch bootc_status', async () => {
    render(<BifrostPage />);
    await waitFor(() =>
      expect(axiosMock).toHaveBeenCalledWith(
        `${INVENTORY_TOTAL_FETCH_URL_SERVER}${INVENTORY_FETCH_BOOTC}&fields[system_profile]=bootc_status`,
      ),
    );

    expect(axiosMock).toHaveBeenCalledWith(
      `${INVENTORY_TOTAL_FETCH_URL_SERVER}${INVENTORY_PACKAGE_BASED_SYSTEMS}&per_page=1`,
    );
  });
});
