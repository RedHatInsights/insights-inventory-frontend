import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import Template from './Template';
import type { PatchAppData } from '@redhat-cloud-services/host-inventory-client';

const noTemplatePatchAppData = {
  template_name: null,
  template_uuid: null,
} as unknown as PatchAppData;

const emptyTemplateNamePatchAppData = {
  template_name: '',
  template_uuid: '00000000-0000-0000-0000-000000000001',
} as unknown as PatchAppData;

const withTemplatePatchAppData = {
  template_name: 'Production baseline',
  template_uuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
} as unknown as PatchAppData;

describe('Template cell', () => {
  it('should show No template when template_name is null', () => {
    render(<Template value={noTemplatePatchAppData} />);

    expect(screen.getByText('No template')).toBeInTheDocument();
  });

  it('should show No template when template_name is empty', () => {
    render(<Template value={emptyTemplateNamePatchAppData} />);

    expect(screen.getByText('No template')).toBeInTheDocument();
  });

  it('should render a link with the template name when template_name is set', () => {
    render(
      <MemoryRouter>
        <Template value={withTemplatePatchAppData} />
      </MemoryRouter>,
    );

    expect(screen.queryByText('No template')).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Production baseline' }),
    ).toBeInTheDocument();
  });
});
