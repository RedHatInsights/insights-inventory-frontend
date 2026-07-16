import '@testing-library/jest-dom';
import { expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import React from 'react';
import CellValue, { NOT_APPLICABLE, NOT_AVAILABLE } from './CellValue';

describe('CellValue', () => {
  it('renders value for type "present"', () => {
    render(<CellValue type="present" value="42" />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders placeholder for type "notSet"', () => {
    render(<CellValue type="notSet" value="No OS" />);
    expect(screen.getByText('No OS')).toBeInTheDocument();
  });

  it(`renders "${NOT_AVAILABLE}" for type "notAvailable"`, () => {
    render(<CellValue type="notAvailable" reason="Data missing" />);
    expect(screen.getByText(NOT_AVAILABLE)).toBeInTheDocument();
  });

  it(`renders "${NOT_APPLICABLE}" for type "notApplicable"`, () => {
    render(<CellValue type="notApplicable" reason="Not supported" />);
    expect(screen.getByText(NOT_APPLICABLE)).toBeInTheDocument();
  });

  describe('noPermission', () => {
    it('renders a lock icon', () => {
      render(<CellValue type="noPermission" serviceName="vulnerability" />);
      expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
    });

    it('has an accessible label with the service name', () => {
      render(<CellValue type="noPermission" serviceName="vulnerability" />);
      expect(
        screen.getByLabelText(
          'You do not have the necessary Vulnerability permissions to view this data. Contact your organization administrator to request Vulnerability read access.',
        ),
      ).toBeInTheDocument();
    });

    it('capitalizes the service name in the label', () => {
      render(<CellValue type="noPermission" serviceName="advisor" />);
      expect(
        screen.getByLabelText(
          'You do not have the necessary Advisor permissions to view this data. Contact your organization administrator to request Advisor read access.',
        ),
      ).toBeInTheDocument();
    });
  });
});
