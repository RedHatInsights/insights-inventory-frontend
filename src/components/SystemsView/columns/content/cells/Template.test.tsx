import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import Template from './Template';
import { TestWrapper } from '../../../../../Utilities/TestingUtilities';
import type { PatchAppData } from '@redhat-cloud-services/host-inventory-client';
import { NOT_AVAILABLE } from '../../../../../constants';

function renderTemplate(appData: PatchAppData | undefined) {
  return render(
    <TestWrapper>
      <Template appData={appData} />
    </TestWrapper>,
  );
}

const templatePatchAppData = {
  template_name: 'Production baseline',
  template_uuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
} as unknown as PatchAppData;

describe('Template cell', () => {
  it(`should show ${NOT_AVAILABLE} when appData is undefined`, () => {
    renderTemplate(undefined);

    expect(screen.getByText(NOT_AVAILABLE)).toBeInTheDocument();
  });

  it('should show No template when template_name is null', () => {
    renderTemplate({
      template_name: null,
      template_uuid: null,
    } as unknown as PatchAppData);

    expect(screen.getByText('No template')).toBeInTheDocument();
  });

  it('should show No template when template_name is empty', () => {
    renderTemplate({
      template_name: '',
      template_uuid: '00000000-0000-0000-0000-000000000001',
    } as unknown as PatchAppData);

    expect(screen.getByText('No template')).toBeInTheDocument();
  });

  it('should render a link with the template name when template_name is set', () => {
    renderTemplate(templatePatchAppData);

    expect(screen.queryByText('No template')).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Production baseline' }),
    ).toBeInTheDocument();
  });
});
