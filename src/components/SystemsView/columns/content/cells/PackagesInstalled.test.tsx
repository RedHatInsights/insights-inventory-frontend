import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import PackagesInstalled, { NOT_SET } from './PackagesInstalled';
import { TestWrapper } from '../../../../../Utilities/TestingUtilities';
import type { PatchAppData } from '@redhat-cloud-services/host-inventory-client';
import { NOT_AVAILABLE } from '../../CellValue';

const systemId = 'test-system-uuid';

function renderPackagesInstalled(appData: PatchAppData | undefined) {
  return render(
    <TestWrapper>
      <PackagesInstalled appData={appData} systemId={systemId} />
    </TestWrapper>,
  );
}

describe('PackagesInstalled cell', () => {
  it(`should show ${NOT_AVAILABLE} when appData is undefined`, () => {
    renderPackagesInstalled(undefined);

    expect(screen.getByText(NOT_AVAILABLE)).toBeInTheDocument();
  });

  it(`should show ${NOT_AVAILABLE} when packages_installed is null`, () => {
    renderPackagesInstalled({
      packages_installed: null,
    } as unknown as PatchAppData);

    expect(screen.getByText(NOT_AVAILABLE)).toBeInTheDocument();
  });

  it(`should show ${NOT_AVAILABLE} when packages_installed is undefined`, () => {
    renderPackagesInstalled({} as unknown as PatchAppData);

    expect(screen.getByText(NOT_AVAILABLE)).toBeInTheDocument();
  });

  it(`should show ${NOT_SET} when packages_installed is 0`, () => {
    renderPackagesInstalled({
      packages_installed: 0,
    } as unknown as PatchAppData);

    expect(screen.getByText(NOT_SET)).toBeInTheDocument();
  });

  it('should render the count as a link to the patch tab when packages_installed is a positive number', () => {
    renderPackagesInstalled({
      packages_installed: 42,
    } as unknown as PatchAppData);

    expect(screen.queryByText(NOT_SET)).not.toBeInTheDocument();
    expect(screen.queryByText(NOT_AVAILABLE)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: '42' })).toHaveAttribute(
      'href',
      `/inventory/${systemId}?appName=patch`,
    );
  });
});
