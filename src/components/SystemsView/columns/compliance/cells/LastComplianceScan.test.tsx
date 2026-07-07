import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import LastComplianceScan from './LastComplianceScan';
import { TestWrapper } from '../../../../../Utilities/TestingUtilities';
import type { ComplianceAppData } from '@redhat-cloud-services/host-inventory-client';
import { NOT_AVAILABLE } from '../../CellValue';

function renderLastComplianceScan(appData: ComplianceAppData | undefined) {
  return render(
    <TestWrapper>
      <LastComplianceScan appData={appData} />
    </TestWrapper>,
  );
}

const LONG_AGO_LAST_SCAN = '2020-01-01T00:00:00.000Z';

describe('LastComplianceScan cell', () => {
  it(`should show ${NOT_AVAILABLE} when appData is undefined`, () => {
    renderLastComplianceScan(undefined);

    expect(screen.getByText(NOT_AVAILABLE)).toBeInTheDocument();
  });

  it(`should show ${NOT_AVAILABLE} when last_scan is null`, () => {
    renderLastComplianceScan({
      last_scan: null,
    } as unknown as ComplianceAppData);

    expect(screen.getByText(NOT_AVAILABLE)).toBeInTheDocument();
  });

  it(`should show ${NOT_AVAILABLE} when last_scan is undefined`, () => {
    renderLastComplianceScan({} as unknown as ComplianceAppData);

    expect(screen.getByText(NOT_AVAILABLE)).toBeInTheDocument();
  });

  it('should render a relative date when last_scan is set', () => {
    renderLastComplianceScan({
      last_scan: LONG_AGO_LAST_SCAN,
    } as unknown as ComplianceAppData);

    expect(screen.getAllByText(/\d+ years ago/).length).toBeGreaterThan(0);
  });
});
