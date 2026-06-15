import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { TestWrapper } from '../../../Utilities/TestingUtilities';
import { ImageBuilderCard, mapImageType } from './ImageBuilderCard';
import instance from '@redhat-cloud-services/frontend-components-utilities/interceptors';

jest.mock(
  '@redhat-cloud-services/frontend-components-utilities/interceptors',
  () => ({
    __esModule: true,
    default: { get: jest.fn() },
  }),
);

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({ pathname: 'localhost:3000/example/path' }),
}));

const BLUEPRINT_ID = 'abc-123-def';

const mockBlueprintResponse = {
  name: 'My Web Server',
  image_requests: [{ image_type: 'aws' }],
};

describe('ImageBuilderCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show loading state initially', () => {
    instance.get.mockReturnValue(new Promise(() => {}));
    render(
      <TestWrapper>
        <ImageBuilderCard blueprintId={BLUEPRINT_ID} />
      </TestWrapper>,
    );

    expect(screen.getByText('Image builder')).toBeInTheDocument();
  });

  it('should render blueprint name and target after loading', async () => {
    instance.get.mockResolvedValue(mockBlueprintResponse);
    render(
      <TestWrapper>
        <ImageBuilderCard blueprintId={BLUEPRINT_ID} />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText('My Web Server')).toBeInTheDocument();
    });

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Target')).toBeInTheDocument();
    expect(screen.getByText('Amazon Web Services')).toBeInTheDocument();
  });

  it('should render blueprint name as a hyperlink', async () => {
    instance.get.mockResolvedValue(mockBlueprintResponse);
    render(
      <TestWrapper>
        <ImageBuilderCard blueprintId={BLUEPRINT_ID} />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText('My Web Server')).toBeInTheDocument();
    });

    const link = screen.getByRole('link', { name: 'My Web Server' });
    expect(link).toHaveAttribute(
      'href',
      `/insights/image-builder?blueprint_id=${BLUEPRINT_ID}`,
    );
  });

  it('should call the correct API endpoint', async () => {
    instance.get.mockResolvedValue(mockBlueprintResponse);
    render(
      <TestWrapper>
        <ImageBuilderCard blueprintId={BLUEPRINT_ID} />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(instance.get).toHaveBeenCalledWith(
        `/api/image-builder/v1/blueprints/${BLUEPRINT_ID}`,
      );
    });
  });

  it('should handle API error gracefully', async () => {
    instance.get.mockRejectedValue(new Error('Network error'));
    render(
      <TestWrapper>
        <ImageBuilderCard blueprintId={BLUEPRINT_ID} />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(screen.getAllByText('Not available')).toHaveLength(2);
    });

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Target')).toBeInTheDocument();
  });

  it('should display raw value for unmapped image types', async () => {
    instance.get.mockResolvedValue({
      name: 'Custom Build',
      image_requests: [{ image_type: 'unknown-future-type' }],
    });
    render(
      <TestWrapper>
        <ImageBuilderCard blueprintId={BLUEPRINT_ID} />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText('unknown-future-type')).toBeInTheDocument();
    });
  });

  it('should display "Not available" when image_requests is empty', async () => {
    instance.get.mockResolvedValue({
      name: 'No Target Build',
      image_requests: [],
    });
    render(
      <TestWrapper>
        <ImageBuilderCard blueprintId={BLUEPRINT_ID} />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText('No Target Build')).toBeInTheDocument();
    });

    expect(screen.getByText('Not available')).toBeInTheDocument();
  });
});

describe('mapImageType', () => {
  it.each([
    ['aws', 'Amazon Web Services'],
    ['ami', 'Amazon Web Services'],
    ['azure', 'Microsoft Azure'],
    ['vhd', 'Microsoft Azure'],
    ['gcp', 'Google Cloud'],
    ['guest-image', 'Virtualization - Guest image (.qcow2)'],
    ['image-installer', 'Bare metal - Installer (.iso)'],
    ['network-installer', 'Network - Installer (.iso)'],
    ['oci', 'Oracle Cloud Infrastructure'],
    ['pxe-tar-xz', 'Network - PXE boot (.tar.xz)'],
    ['vsphere', 'VMware vSphere - Virtual disk (.vmdk)'],
    ['vsphere-ova', 'VMware vSphere - Open virtualization format (.ova)'],
    ['wsl', 'WSL - Windows Subsystem for Linux (.wsl)'],
    ['bootable-container-iso', 'RHEL Image Mode'],
  ])('maps "%s" to "%s"', (raw, expected) => {
    expect(mapImageType(raw)).toBe(expected);
  });

  it('returns raw value for unmapped types', () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    expect(mapImageType('edge-commit')).toBe('edge-commit');
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Unknown image type "edge-commit"'),
    );
    consoleSpy.mockRestore();
  });

  it('returns "Not available" for undefined', () => {
    expect(mapImageType(undefined)).toBe('Not available');
  });
});
