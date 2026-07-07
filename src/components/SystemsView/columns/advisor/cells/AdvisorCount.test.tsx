import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import AdvisorCount from './AdvisorCount';
import { TestWrapper } from '../../../../../Utilities/TestingUtilities';
import type { AdvisorAppData } from '@redhat-cloud-services/host-inventory-client';
import { NOT_AVAILABLE } from '../../CellValue';

function renderAdvisorCount(
  appData: AdvisorAppData | undefined,
  countField: keyof AdvisorAppData = 'critical',
) {
  return render(
    <TestWrapper>
      <AdvisorCount appData={appData} countField={countField} />
    </TestWrapper>,
  );
}

describe('AdvisorCount cell', () => {
  it(`should show ${NOT_AVAILABLE} when appData is undefined`, () => {
    renderAdvisorCount(undefined);

    expect(screen.getByText(NOT_AVAILABLE)).toBeInTheDocument();
  });

  it(`should show ${NOT_AVAILABLE} when count is null`, () => {
    renderAdvisorCount({
      critical: null,
    } as unknown as AdvisorAppData);

    expect(screen.getByText(NOT_AVAILABLE)).toBeInTheDocument();
  });

  it(`should show ${NOT_AVAILABLE} when count is undefined`, () => {
    renderAdvisorCount({} as unknown as AdvisorAppData);

    expect(screen.getByText(NOT_AVAILABLE)).toBeInTheDocument();
  });

  it('should render plain 0 when count is 0', () => {
    renderAdvisorCount({
      critical: 0,
    } as unknown as AdvisorAppData);

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('should render the count when it is greater than 0', () => {
    renderAdvisorCount(
      {
        recommendations: 12,
      } as unknown as AdvisorAppData,
      'recommendations',
    );

    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
