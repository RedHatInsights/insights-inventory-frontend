import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import React from 'react';
import columns from './columnDefinitions';
import type { InventoryViewHost } from '../../hooks/useInventoryViewsQuery';
import type { Column } from '../allColumnDefinitions';
import { ApiHostViewsGetHostViewsOrderByEnum } from '@redhat-cloud-services/host-inventory-client/ApiHostViewsGetHostViews';

const makeSystem = (id = 'test-id') =>
  ({
    id,
    app_data: {
      advisor: {
        recommendations: 3,
        incidents: 4,
        critical: 6,
        important: 5,
        moderate: 2,
        low: 1,
      },
    },
  }) as unknown as InventoryViewHost;

describe('advisor columnDefinitions', () => {
  it('should export six columns', () => {
    expect(columns).toHaveLength(6);
  });

  it('should export columns in the correct order', () => {
    const keys = columns.map((col) => col.key);
    expect(keys).toEqual([
      'recommendations',
      'incidents',
      'critical',
      'important',
      'moderate',
      'low',
    ]);
  });

  it.each(columns)('should have correct title for "$key"', (column) => {
    expect(column.title).toBe(
      column.key.charAt(0).toUpperCase() + column.key.slice(1),
    );
  });

  it.each(columns)('should not be shown by default for "$key"', (column) => {
    expect(column.isShownByDefault).toBe(false);
    expect(column.isShown).toBe(false);
  });

  it('should set sortBy on recommendations column', () => {
    const rec = columns.find((c) => c.key === 'recommendations') as Column;
    expect(rec.sortBy).toBe(
      ApiHostViewsGetHostViewsOrderByEnum.Advisorrecommendations,
    );
  });

  it('should set sortBy on incidents column', () => {
    const inc = columns.find((c) => c.key === 'incidents') as Column;
    expect(inc.sortBy).toBe(
      ApiHostViewsGetHostViewsOrderByEnum.Advisorincidents,
    );
  });

  it('should not set sortBy on non-sortable columns', () => {
    const nonSortable = columns.filter(
      (c) => c.key !== 'recommendations' && c.key !== 'incidents',
    );
    nonSortable.forEach((col) => {
      expect(col).not.toHaveProperty('sortBy');
    });
  });

  it.each(columns)('should render a cell for "$key"', (column) => {
    const system = makeSystem();
    const { container } = render(<>{column.renderCell(system)}</>);
    expect(container).not.toBeEmptyDOMElement();
  });
});
