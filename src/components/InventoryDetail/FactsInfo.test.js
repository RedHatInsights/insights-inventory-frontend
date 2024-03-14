import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import FactsInfo from './FactsInfo';

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
      />
    );

    expect(screen.getByText(/centos linux system/i)).toBeVisible();
  });
});
