import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import AppDataCount, { buildSystemLink } from './AppDataCount';
import { TestWrapper } from '../../../Utilities/TestingUtilities';
import { NOT_AVAILABLE } from '../../../constants';

const SYSTEM_ID = 'test-system-id';

describe('buildSystemLink', () => {
  it('builds per-app system links with optional search', () => {
    expect(buildSystemLink('vulnerability', SYSTEM_ID, 'impact=7')).toBe(
      `/insights/vulnerability/systems/${SYSTEM_ID}?impact=7`,
    );
  });
});

describe('AppDataCount', () => {
  it('renders N/A when count is not a number', () => {
    render(
      <TestWrapper>
        <AppDataCount
          count={null}
          appName="vulnerability"
          systemId={SYSTEM_ID}
        />
      </TestWrapper>,
    );

    expect(screen.getByText(NOT_AVAILABLE)).toBeInTheDocument();
  });

  it('renders plain 0 without a link when linked', () => {
    render(
      <TestWrapper>
        <AppDataCount count={0} appName="vulnerability" systemId={SYSTEM_ID} />
      </TestWrapper>,
    );

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders a per-app system link when appName and systemId are provided', () => {
    render(
      <TestWrapper>
        <AppDataCount
          count={12}
          appName="vulnerability"
          systemId={SYSTEM_ID}
          search="impact=7"
        />
      </TestWrapper>,
    );

    expect(screen.getByRole('link', { name: '12' })).toHaveAttribute(
      'href',
      `/insights/vulnerability/systems/${SYSTEM_ID}?impact=7`,
    );
  });

  it('renders an explicit to link for non-system targets', () => {
    render(
      <TestWrapper>
        <AppDataCount count={3} to="/insights/compliance/reports" />
      </TestWrapper>,
    );

    expect(screen.getByRole('link', { name: '3' })).toHaveAttribute(
      'href',
      '/insights/compliance/reports',
    );
  });

  it('renders plain count when linked is false', () => {
    render(
      <TestWrapper>
        <AppDataCount count={5} linked={false} />
      </TestWrapper>,
    );

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders N/A for linked counts without a resolvable link target', () => {
    render(
      <TestWrapper>
        <AppDataCount count={4} />
      </TestWrapper>,
    );

    expect(screen.getByText(NOT_AVAILABLE)).toBeInTheDocument();
  });

  it('renders N/A when systemId is missing for per-app links', () => {
    render(
      <TestWrapper>
        <AppDataCount count={4} appName="malware" />
      </TestWrapper>,
    );

    expect(screen.getByText(NOT_AVAILABLE)).toBeInTheDocument();
  });
});
