import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import RemediationPlans from './RemediationPlans';
import { TestWrapper } from '../../../../../Utilities/TestingUtilities';
import type { RemediationsAppData } from '@redhat-cloud-services/host-inventory-client';
import { NOT_AVAILABLE } from '../../CellValue';

function renderRemediationPlans(appData: RemediationsAppData | undefined) {
  return render(
    <TestWrapper>
      <RemediationPlans appData={appData} />
    </TestWrapper>,
  );
}

describe('RemediationPlans cell', () => {
  it(`should show ${NOT_AVAILABLE} when appData is undefined`, () => {
    renderRemediationPlans(undefined);

    expect(screen.getByText(NOT_AVAILABLE)).toBeInTheDocument();
  });

  it(`should show ${NOT_AVAILABLE} when count is null`, () => {
    renderRemediationPlans({
      remediations_plans: null,
    } as unknown as RemediationsAppData);

    expect(screen.getByText(NOT_AVAILABLE)).toBeInTheDocument();
  });

  it(`should show ${NOT_AVAILABLE} when count is undefined`, () => {
    renderRemediationPlans({} as unknown as RemediationsAppData);

    expect(screen.getByText(NOT_AVAILABLE)).toBeInTheDocument();
  });

  it('should render plain 0 when count is 0', () => {
    renderRemediationPlans({
      remediations_plans: 0,
    } as unknown as RemediationsAppData);

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('should render the count when it is greater than 0', () => {
    renderRemediationPlans({
      remediations_plans: 5,
    } as unknown as RemediationsAppData);

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
