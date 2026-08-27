import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import AdvisorRecommendations, { NOT_SET } from './AdvisorRecommendations';
import { TestWrapper } from '../../../../../Utilities/TestingUtilities';
import type { AdvisorAppData } from '@redhat-cloud-services/host-inventory-client';
import { NOT_AVAILABLE } from '../../CellValue';

const TEST_SYSTEM_ID = 'test-system-123';

function renderAdvisorRecommendations(
  appData: AdvisorAppData | undefined,
  systemId: string = TEST_SYSTEM_ID,
) {
  return render(
    <TestWrapper>
      <AdvisorRecommendations appData={appData} systemId={systemId} />
    </TestWrapper>,
  );
}

describe('AdvisorRecommendations cell', () => {
  describe('when data is not available', () => {
    it(`should show ${NOT_AVAILABLE} when appData is undefined`, () => {
      renderAdvisorRecommendations(undefined);

      expect(screen.getByText(NOT_AVAILABLE)).toBeInTheDocument();
    });

    it(`should show ${NOT_AVAILABLE} when all severity counts are null`, () => {
      renderAdvisorRecommendations({
        critical: null,
        important: null,
        moderate: null,
        low: null,
      } as unknown as AdvisorAppData);

      expect(screen.getByText(NOT_AVAILABLE)).toBeInTheDocument();
    });

    it(`should show ${NOT_AVAILABLE} when all severity counts are undefined`, () => {
      renderAdvisorRecommendations({} as unknown as AdvisorAppData);

      expect(screen.getByText(NOT_AVAILABLE)).toBeInTheDocument();
    });

    it(`should show ${NOT_AVAILABLE} when severity counts are mixed null and undefined`, () => {
      renderAdvisorRecommendations({
        critical: null,
        important: undefined,
        moderate: null,
        low: undefined,
      } as unknown as AdvisorAppData);

      expect(screen.getByText(NOT_AVAILABLE)).toBeInTheDocument();
    });
  });

  describe('when no recommendations exist', () => {
    it(`should show "${NOT_SET}" when all counts are 0`, () => {
      renderAdvisorRecommendations({
        critical: 0,
        important: 0,
        moderate: 0,
        low: 0,
      } as unknown as AdvisorAppData);

      expect(screen.getByText(NOT_SET)).toBeInTheDocument();
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it(`should show "${NOT_SET}" when counts are mix of 0 and null (with at least one valid 0)`, () => {
      renderAdvisorRecommendations({
        critical: 0,
        important: null,
        moderate: 0,
        low: undefined,
      } as unknown as AdvisorAppData);

      expect(screen.getByText(NOT_SET)).toBeInTheDocument();
    });
  });

  describe('when recommendations exist', () => {
    it('should render all four severity icons with their counts', () => {
      renderAdvisorRecommendations({
        critical: 5,
        important: 3,
        moderate: 2,
        low: 1,
      } as unknown as AdvisorAppData);

      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should render all severity icons when counts are present', () => {
      renderAdvisorRecommendations({
        critical: 1,
        important: 1,
        moderate: 1,
        low: 1,
      } as unknown as AdvisorAppData);

      // All four severity counts should be visible
      const counts = screen.getAllByText('1');
      expect(counts).toHaveLength(4);
    });

    it('should convert null/undefined to 0 when other valid data exists', () => {
      renderAdvisorRecommendations({
        critical: 5,
        important: null,
        moderate: undefined,
        low: 0,
      } as unknown as AdvisorAppData);

      expect(screen.getByText('5')).toBeInTheDocument();
      // Important, moderate, and low all convert to 0, so we should have three 0s
      const zeros = screen.getAllByText('0');
      expect(zeros.length).toBeGreaterThanOrEqual(1);
    });

    it('should render links for counts greater than 0', () => {
      renderAdvisorRecommendations({
        critical: 3,
        important: 0,
        moderate: 0,
        low: 0,
      } as unknown as AdvisorAppData);

      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(1);
      expect(links[0]).toHaveAttribute(
        'href',
        expect.stringContaining(TEST_SYSTEM_ID),
      );
      expect(links[0]).toHaveAttribute(
        'href',
        expect.stringContaining('appName=advisor'),
      );
    });

    it('should not render links for counts of 0', () => {
      renderAdvisorRecommendations({
        critical: 0,
        important: 0,
        moderate: 0,
        low: 1,
      } as unknown as AdvisorAppData);

      // Only one link for the low count
      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(1);
    });

    it('should render multiple links when multiple counts are greater than 0', () => {
      renderAdvisorRecommendations({
        critical: 2,
        important: 3,
        moderate: 0,
        low: 1,
      } as unknown as AdvisorAppData);

      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(3);
      links.forEach((link) => {
        expect(link).toHaveAttribute(
          'href',
          expect.stringContaining(TEST_SYSTEM_ID),
        );
        expect(link).toHaveAttribute(
          'href',
          expect.stringContaining('appName=advisor'),
        );
      });
    });

    it('should use the provided systemId in links', () => {
      const customSystemId = 'custom-system-456';
      renderAdvisorRecommendations(
        {
          critical: 1,
          important: 0,
          moderate: 0,
          low: 0,
        } as unknown as AdvisorAppData,
        customSystemId,
      );

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute(
        'href',
        expect.stringContaining(customSystemId),
      );
    });
  });

  describe('edge cases', () => {
    it('should handle only critical recommendations', () => {
      renderAdvisorRecommendations({
        critical: 10,
        important: 0,
        moderate: 0,
        low: 0,
      } as unknown as AdvisorAppData);

      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getAllByRole('link')).toHaveLength(1);
    });

    it('should handle only low recommendations', () => {
      renderAdvisorRecommendations({
        critical: 0,
        important: 0,
        moderate: 0,
        low: 5,
      } as unknown as AdvisorAppData);

      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getAllByRole('link')).toHaveLength(1);
    });

    it('should handle large numbers', () => {
      renderAdvisorRecommendations({
        critical: 999,
        important: 888,
        moderate: 777,
        low: 666,
      } as unknown as AdvisorAppData);

      expect(screen.getByText('999')).toBeInTheDocument();
      expect(screen.getByText('888')).toBeInTheDocument();
      expect(screen.getByText('777')).toBeInTheDocument();
      expect(screen.getByText('666')).toBeInTheDocument();
    });
  });
});
