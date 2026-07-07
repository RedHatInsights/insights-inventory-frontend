import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import Policies from './Policies';
import { TestWrapper } from '../../../../../Utilities/TestingUtilities';
import type { ComplianceAppData } from '@redhat-cloud-services/host-inventory-client';
import { NOT_AVAILABLE } from '../../CellValue';

const COMPLIANCE_REPORTS_PATH = '//compliance/reports';

function renderPolicies(appData: ComplianceAppData | undefined) {
  return render(
    <TestWrapper>
      <Policies appData={appData} />
    </TestWrapper>,
  );
}

describe('Policies cell', () => {
  it(`should show ${NOT_AVAILABLE} when appData is undefined`, () => {
    renderPolicies(undefined);

    expect(screen.getByText(NOT_AVAILABLE)).toBeInTheDocument();
  });

  it(`should show ${NOT_AVAILABLE} when policies is null`, () => {
    renderPolicies({
      policies: null,
    } as unknown as ComplianceAppData);

    expect(screen.getByText(NOT_AVAILABLE)).toBeInTheDocument();
  });

  it(`should show ${NOT_AVAILABLE} when policies is undefined`, () => {
    renderPolicies({} as unknown as ComplianceAppData);

    expect(screen.getByText(NOT_AVAILABLE)).toBeInTheDocument();
  });

  it('should render a link with zero when policies is empty', () => {
    renderPolicies({
      policies: [],
    } as unknown as ComplianceAppData);

    expect(screen.getByRole('link', { name: '0' })).toHaveAttribute(
      'href',
      COMPLIANCE_REPORTS_PATH,
    );
  });

  it('should render a link with the policy count when policies are present', () => {
    renderPolicies({
      policies: [{}, {}],
    } as unknown as ComplianceAppData);

    expect(screen.getByRole('link', { name: '2' })).toHaveAttribute(
      'href',
      COMPLIANCE_REPORTS_PATH,
    );
  });
});
