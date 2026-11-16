import { renderHook, waitFor } from '@testing-library/react';
import { expect, jest } from '@jest/globals';
import { useRef } from 'react';
import type { SetURLSearchParams } from 'react-router-dom';
import { useRecoveryPage, type PageCorrection } from './useRecoveryPage';

const renderRecoveryPage = (page: number | null) => {
  const setSearchParams = jest.fn<SetURLSearchParams>();
  const view = renderHook(
    ({ nextPage }: { nextPage: number | null }) => {
      const correctedSignatureRef = useRef<PageCorrection | null>(null);
      useRecoveryPage(
        nextPage,
        setSearchParams,
        'filters',
        correctedSignatureRef,
      );
      return correctedSignatureRef;
    },
    { initialProps: { nextPage: page } },
  );

  return { ...view, setSearchParams };
};

describe('useRecoveryPage', () => {
  const originalUrl = window.location.href;

  afterEach(() => {
    window.history.replaceState({}, '', originalUrl);
  });

  it('does nothing when no page correction is needed', async () => {
    const { setSearchParams, result } = renderRecoveryPage(null);

    await waitFor(() => {
      expect(setSearchParams).not.toHaveBeenCalled();
    });
    expect(result.current.current).toBeNull();
  });

  it('writes the page and keeps the other query params', async () => {
    window.history.pushState({}, '', '/?hostname_or_id=web-01&per_page=10');
    const { setSearchParams, result } = renderRecoveryPage(3);

    await waitFor(() => {
      expect(setSearchParams).toHaveBeenCalledTimes(1);
    });

    const params = setSearchParams.mock.calls[0][0] as URLSearchParams;
    const options = setSearchParams.mock.calls[0][1];
    expect(params.get('page')).toBe('3');
    expect(params.get('hostname_or_id')).toBe('web-01');
    expect(params.get('per_page')).toBe('10');
    expect(options).toEqual({ replace: true });
    expect(result.current.current).toEqual({ signature: 'filters', page: 3 });
  });

  it('clears the marker when the correction ends', async () => {
    window.history.pushState({}, '', '/?hostname_or_id=web-01&per_page=10');
    const { setSearchParams, result, rerender } = renderRecoveryPage(3);

    await waitFor(() => {
      expect(setSearchParams).toHaveBeenCalledTimes(1);
    });

    rerender({ nextPage: null });

    await waitFor(() => {
      expect(result.current.current).toBeNull();
    });
  });
});
