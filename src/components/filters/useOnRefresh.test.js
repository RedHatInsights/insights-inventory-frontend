import useOnRefresh from './useOnRefresh';
import { MemoryRouter } from 'react-router-dom';
import { act, renderHook } from '@testing-library/react';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('useOnRefresh', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('triggers navigate on filter', () => {
    const { result } = renderHook(useOnRefresh, {
      wrapper: MemoryRouter,
    });

    act(() =>
      result.current({ filters: [{ value: 'hostname_or_id', filter: 'test' }] })
    );
    expect(mockNavigate).toHaveBeenCalledWith({
      hash: '',
      pathname: '',
      search: 'hostname_or_id=test',
    });
  });

  it('triggers navigate on pagination change', () => {
    const { result } = renderHook(useOnRefresh, {
      wrapper: MemoryRouter,
    });

    act(() => result.current({ page: 10, per_page: 100 }));
    expect(mockNavigate).toHaveBeenCalledWith({
      hash: '',
      pathname: '',
      search: 'page=10&per_page=100',
    });
  });

  it('calls custom callback', () => {
    const mockCallback = jest.fn();
    const { result } = renderHook(() => useOnRefresh(mockCallback), {
      wrapper: MemoryRouter,
    });

    act(() => result.current());
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('calls default callback', () => {
    const mockCallback = jest.fn();
    const { result } = renderHook(useOnRefresh, {
      wrapper: MemoryRouter,
    });

    act(() => result.current({}, mockCallback));
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });
});
