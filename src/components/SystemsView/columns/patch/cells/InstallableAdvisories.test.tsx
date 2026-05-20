import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import InstallableAdvisories from './InstallableAdvisories';
import type { PatchAppData } from '@redhat-cloud-services/host-inventory-client';

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
  it('should show No installable advisories when all installable counts are zero', () => {
    render(<InstallableAdvisories value={allZeroPatchAppData} />);

    expect(screen.getByText('No installable advisories')).toBeInTheDocument();
  });

  it('should render only the security advisory icon and count when rhsa is non-zero', () => {
    render(<InstallableAdvisories value={securityOnlyPatchAppData} />);

    expect(
      screen.queryByText('No installable advisories'),
    ).not.toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('should render only the bug fix advisory icon and count when rhba is non-zero', () => {
    render(<InstallableAdvisories value={bugfixesOnlyPatchAppData} />);

    expect(
      screen.queryByText('No installable advisories'),
    ).not.toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('should render only the enhancement advisory icon and count when rhea is non-zero', () => {
    render(<InstallableAdvisories value={enhancementsOnlyPatchAppData} />);

    expect(
      screen.queryByText('No installable advisories'),
    ).not.toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should render only the other advisory icon and count when other is non-zero', () => {
    render(<InstallableAdvisories value={otherOnlyPatchAppData} />);

    expect(
      screen.queryByText('No installable advisories'),
    ).not.toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should render all advisory type counts when each installable count is non-zero', () => {
    render(<InstallableAdvisories value={mixedCountsPatchAppData} />);

    expect(
      screen.queryByText('No installable advisories'),
    ).not.toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('11')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
  });
});
