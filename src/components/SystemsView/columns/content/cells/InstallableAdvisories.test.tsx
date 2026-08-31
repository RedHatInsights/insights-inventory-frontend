import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import InstallableAdvisories, { NOT_SET } from './InstallableAdvisories';
import { NOT_AVAILABLE } from '../../CellValue';
import { TestWrapper } from '../../../../../Utilities/TestingUtilities';
import type { PatchAppData } from '@redhat-cloud-services/host-inventory-client';

const systemId = 'test-system-uuid';
const getInventoryPatchPath = (advisoryType: string) =>
  `//inventory/${systemId}?appName=patch&offset=0&filter[advisory_type_name]=${advisoryType}`;

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

  it('should render all advisory types, with only security being non-zero', () => {
    renderInstallableAdvisories(securityOnlyPatchAppData);

    expect(screen.queryByText(NOT_SET)).not.toBeInTheDocument();
    // Non-zero count (security)
    expect(screen.getByText('7')).toBeInTheDocument();
    // Zero counts (should still be visible)
    expect(screen.getAllByText('0')).toHaveLength(3); // bug fixes, enhancements, other
  });

  it('should render all advisory types, with only bug fixes being non-zero', () => {
    renderInstallableAdvisories(bugfixesOnlyPatchAppData);

    expect(screen.queryByText(NOT_SET)).not.toBeInTheDocument();
    // Non-zero count (bug fixes)
    expect(screen.getByText('4')).toBeInTheDocument();
    // Zero counts (should still be visible)
    expect(screen.getAllByText('0')).toHaveLength(3); // security, enhancements, other
  });

  it('should render all advisory types, with only enhancements being non-zero', () => {
    renderInstallableAdvisories(enhancementsOnlyPatchAppData);

    expect(screen.queryByText(NOT_SET)).not.toBeInTheDocument();
    // Non-zero count (enhancements)
    expect(screen.getByText('2')).toBeInTheDocument();
    // Zero counts (should still be visible)
    expect(screen.getAllByText('0')).toHaveLength(3); // security, bug fixes, other
  });

  it('should render all advisory types, with only other being non-zero', () => {
    renderInstallableAdvisories(otherOnlyPatchAppData);

    expect(screen.queryByText(NOT_SET)).not.toBeInTheDocument();
    // Non-zero count (other)
    expect(screen.getByText('1')).toBeInTheDocument();
    // Zero counts (should still be visible)
    expect(screen.getAllByText('0')).toHaveLength(3); // security, bug fixes, enhancements
  });

  it('should render all advisory type counts when each installable count is non-zero', () => {
    renderInstallableAdvisories(mixedCountsPatchAppData);

    expect(screen.queryByText(NOT_SET)).not.toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('11')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
  });

  it('should link each non-zero advisory type to the filtered patch system page', () => {
    renderInstallableAdvisories(mixedCountsPatchAppData);

    // Security advisories (count: 5)
    expect(screen.getByRole('link', { name: '5' })).toHaveAttribute(
      'href',
      getInventoryPatchPath('security'),
    );

    // Bug fixes (count: 11)
    expect(screen.getByRole('link', { name: '11' })).toHaveAttribute(
      'href',
      getInventoryPatchPath('bugfix'),
    );

    // Enhancements (count: 3)
    expect(screen.getByRole('link', { name: '3' })).toHaveAttribute(
      'href',
      getInventoryPatchPath('enhancement'),
    );

    // Other (count: 9)
    expect(screen.getByRole('link', { name: '9' })).toHaveAttribute(
      'href',
      getInventoryPatchPath('other'),
    );
  });

  it('should not link zero-count advisory types', () => {
    renderInstallableAdvisories(securityOnlyPatchAppData);

    // Security (count: 7) should be a link
    expect(screen.getByRole('link', { name: '7' })).toBeInTheDocument();

    // Zero counts should NOT be links (there should be no links with text '0')
    expect(screen.queryAllByRole('link', { name: '0' })).toHaveLength(0);

    // But the zero text should still be visible (3 times: bug fixes, enhancements, other)
    expect(screen.getAllByText('0')).toHaveLength(3);
  });
});
