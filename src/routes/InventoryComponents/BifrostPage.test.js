import React from 'react';
import { render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import BifrostPage from './BifrostPage';
import mockedBootCStatusData from '../../__mocks__/mockedBootCStatusData.json';
import {
  INVENTORY_TOTAL_FETCH_URL_SERVER,
  INVENTORY_FETCH_BOOTC,
  INVENTORY_FETCH_NON_BOOTC,
  INVENTORY_FILTER_NO_HOST_TYPE,
} from '../../Utilities/constants';

jest.mock('axios');

describe('BifrostPage', () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({
      data: mockedBootCStatusData,
    });
  });

  test('should fetch bootc_status', async () => {
    render(<BifrostPage />);
    await waitFor(() =>
      expect(axios.get).toHaveBeenCalledWith(
        `${INVENTORY_TOTAL_FETCH_URL_SERVER}${INVENTORY_FETCH_BOOTC}&fields[system_profile]=bootc_status`
      )
    );

    expect(axios.get).toHaveBeenCalledWith(
      `${INVENTORY_TOTAL_FETCH_URL_SERVER}${INVENTORY_FETCH_NON_BOOTC}&${INVENTORY_FILTER_NO_HOST_TYPE}&per_page=1`
    );
  });
});
