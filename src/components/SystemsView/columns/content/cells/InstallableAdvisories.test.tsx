import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import InstallableAdvisories, { NOT_SET } from './InstallableAdvisories';
import { NOT_AVAILABLE } from '../../CellValue';
import { TestWrapper } from '../../../../../Utilities/TestingUtilities';
import type { PatchAppData } from '@redhat-cloud-services/host-inventory-client';

const systemId = 'test-system-uuid';
const PATCH_SYSTEM_PATH = `//patch/systems/${systemId}`;

function renderInstallableAdvisories(appData: PatchAppData | undefined) {
  return render(
    <TestWrapper>
      <InstallableAdvisories appData={appData} systemId={systemId} />
    </TestWrapper>,
  );
}

const allZeroPatchAppData = {
  advisories_rhea_installable: 0,
  advisories_rhba_installable: 0,
  advisories_rhsa_installable: 0,
  advisories_other_installable: 0,
} as unknown as PatchAppData;

const securityOnlyPatchAppData = {
  advisories_rhea_installable: 0,
  advisories_rhba_installable: 0,
  advisories_rhsa_installable: 7,
  advisories_other_installable: 0,
} as unknown as PatchAppData;

const bugfixesOnlyPatchAppData = {
  advisories_rhea_installable: 0,
  advisories_rhba_installable: 4,
  advisories_rhsa_installable: 0,
  advisories_other_installable: 0,
} as unknown as PatchAppData;

const enhancementsOnlyPatchAppData = {
  advisories_rhea_installable: 2,
  advisories_rhba_installable: 0,
  advisories_rhsa_installable: 0,
  advisories_other_installable: 0,
} as unknown as PatchAppData;

const otherOnlyPatchAppData = {
  advisories_rhea_installable: 0,
  advisories_rhba_installable: 0,
  advisories_rhsa_installable: 0,
  advisories_other_installable: 1,
} as unknown as PatchAppData;

const mixedCountsPatchAppData = {
  advisories_rhea_installable: 3,
  advisories_rhba_installable: 11,
  advisories_rhsa_installable: 5,
  advisories_other_installable: 9,
} as unknown as PatchAppData;

describe('InstallableAdvisories cell', () => {
  it(`should show ${NOT_AVAILABLE} when appData is undefined`, () => {
    renderInstallableAdvisories(undefined);

    expect(screen.getByText(NOT_AVAILABLE)).toBeInTheDocument();
  });

  it(`should show ${NOT_SET} when all installable counts are zero`, () => {
    renderInstallableAdvisories(allZeroPatchAppData);

    expect(screen.getByText(NOT_SET)).toBeInTheDocument();
  });

  it('should render only the security advisory icon and count when rhsa is non-zero', () => {
    renderInstallableAdvisories(securityOnlyPatchAppData);

    expect(screen.queryByText(NOT_SET)).not.toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('should render only the bug fix advisory icon and count when rhba is non-zero', () => {
    renderInstallableAdvisories(bugfixesOnlyPatchAppData);

    expect(screen.queryByText(NOT_SET)).not.toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('should render only the enhancement advisory icon and count when rhea is non-zero', () => {
    renderInstallableAdvisories(enhancementsOnlyPatchAppData);

    expect(screen.queryByText(NOT_SET)).not.toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should render only the other advisory icon and count when other is non-zero', () => {
    renderInstallableAdvisories(otherOnlyPatchAppData);

    expect(screen.queryByText(NOT_SET)).not.toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should render all advisory type counts when each installable count is non-zero', () => {
    renderInstallableAdvisories(mixedCountsPatchAppData);

    expect(screen.queryByText(NOT_SET)).not.toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('11')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
  });

  it('should link each advisory type to the patch system page', () => {
    renderInstallableAdvisories(mixedCountsPatchAppData);

    ['5', '11', '3', '9'].forEach((count) => {
      expect(screen.getByRole('link', { name: count })).toHaveAttribute(
        'href',
        PATCH_SYSTEM_PATH,
      );
    });
  });
});
