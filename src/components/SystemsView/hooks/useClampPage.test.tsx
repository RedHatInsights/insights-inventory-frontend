import { renderHook } from '@testing-library/react';
import { expect, jest } from '@jest/globals';
import { useClampPage } from './useClampPage';

describe('useClampPage', () => {
  it('does nothing when the page is within range', () => {
    const onSetPage = jest.fn();

    renderHook(() =>
      useClampPage({ page: 2, perPage: 50, total: 51, onSetPage }),
    );

    expect(onSetPage).not.toHaveBeenCalled();
  });

  it('does nothing while total is unknown', () => {
    const onSetPage = jest.fn();

    renderHook(() =>
      useClampPage({ page: 3, perPage: 50, total: undefined, onSetPage }),
    );

    expect(onSetPage).not.toHaveBeenCalled();
  });

  it('moves to the new last page when the current page is past the end', () => {
    const onSetPage = jest.fn();

    renderHook(() =>
      useClampPage({ page: 3, perPage: 50, total: 51, onSetPage }),
    );

    expect(onSetPage).toHaveBeenCalledTimes(1);
    expect(onSetPage).toHaveBeenCalledWith(undefined, 2);
  });

  it('moves to page 1 when nothing remains', () => {
    const onSetPage = jest.fn();

    renderHook(() =>
      useClampPage({ page: 2, perPage: 50, total: 0, onSetPage }),
    );

    expect(onSetPage).toHaveBeenCalledWith(undefined, 1);
  });

  it('reclamps when total shrinks below the current page', () => {
    const onSetPage = jest.fn();

    const { rerender } = renderHook(
      ({ total }: { total: number }) =>
        useClampPage({ page: 2, perPage: 50, total, onSetPage }),
      { initialProps: { total: 100 } },
    );

    expect(onSetPage).not.toHaveBeenCalled();

    rerender({ total: 40 });

    expect(onSetPage).toHaveBeenCalledTimes(1);
    expect(onSetPage).toHaveBeenCalledWith(undefined, 1);
  });
});
