import { renderHook } from '@testing-library/react';
import { expect, jest } from '@jest/globals';
import { useCorrectOutOfRangePage } from './useCorrectOutOfRangePage';

const base = {
  perPage: 50,
  total: undefined as number | undefined,
  isPageNotFound: false,
  isSuccess: false,
  onSetPage: jest.fn(),
};

describe('useCorrectOutOfRangePage', () => {
  it('steps back one page on the first not-found page', () => {
    const onSetPage = jest.fn();

    renderHook(() =>
      useCorrectOutOfRangePage({
        ...base,
        page: 3,
        isPageNotFound: true,
        onSetPage,
      }),
    );

    expect(onSetPage).toHaveBeenCalledTimes(1);
    expect(onSetPage).toHaveBeenCalledWith(undefined, 2);
  });

  it('jumps to page 1 when the stepped-back page is also not found', () => {
    const onSetPage = jest.fn();

    const { rerender } = renderHook(
      (props: { page: number; isPageNotFound: boolean; isSuccess: boolean }) =>
        useCorrectOutOfRangePage({ ...base, ...props, onSetPage }),
      {
        initialProps: { page: 4, isPageNotFound: true, isSuccess: false },
      },
    );

    expect(onSetPage).toHaveBeenCalledWith(undefined, 3);

    rerender({ page: 3, isPageNotFound: false, isSuccess: false });
    rerender({ page: 3, isPageNotFound: true, isSuccess: false });

    expect(onSetPage).toHaveBeenCalledTimes(2);
    expect(onSetPage).toHaveBeenLastCalledWith(undefined, 1);
  });

  it('leaves a not-found page 1 in place', () => {
    const onSetPage = jest.fn();

    const { result } = renderHook(() =>
      useCorrectOutOfRangePage({
        ...base,
        page: 1,
        isPageNotFound: true,
        onSetPage,
      }),
    );

    expect(onSetPage).not.toHaveBeenCalled();
    expect(result.current).toBe(false);
  });

  it('steps back one page again after a later page loads successfully', () => {
    const onSetPage = jest.fn();

    const { rerender } = renderHook(
      (props: {
        page: number;
        isPageNotFound: boolean;
        isSuccess: boolean;
        total?: number;
      }) => useCorrectOutOfRangePage({ ...base, ...props, onSetPage }),
      {
        initialProps: {
          page: 5,
          isPageNotFound: true,
          isSuccess: false,
          total: undefined as number | undefined,
        },
      },
    );

    rerender({
      page: 4,
      isPageNotFound: false,
      isSuccess: true,
      total: 200,
    });
    rerender({
      page: 4,
      isPageNotFound: true,
      isSuccess: false,
      total: 200,
    });

    expect(onSetPage).toHaveBeenNthCalledWith(1, undefined, 4);
    expect(onSetPage).toHaveBeenLastCalledWith(undefined, 3);
  });

  it('moves to the last page a successful total can fill', () => {
    const onSetPage = jest.fn();

    renderHook(() =>
      useCorrectOutOfRangePage({
        ...base,
        page: 3,
        total: 51,
        isSuccess: true,
        onSetPage,
      }),
    );

    expect(onSetPage).toHaveBeenCalledWith(undefined, 2);
  });

  it('reports a not-found page above page 1 as still recovering', () => {
    const { result } = renderHook(() =>
      useCorrectOutOfRangePage({
        ...base,
        page: 2,
        isPageNotFound: true,
      }),
    );

    expect(result.current).toBe(true);
  });
});
