import { act, renderHook } from '@testing-library/react';
import { useRegisteredWithFilter } from './useRegisteredWithFilter';

describe('useRegisteredWithFilter', () => {
  it('should create filter', () => {
    const { result } = renderHook(() => useRegisteredWithFilter());
    const [filter] = result.current;

    expect(filter).toMatchObject({
      label: 'Data collector',
      value: 'data-collector-registered-with',
      type: 'checkbox',
    });
    expect(filter.filterValues.value.length).toBe(0);
    expect(filter.filterValues.items).toMatchObject([
      { label: 'insights-client', value: 'puptoo' },
      { label: 'subscription-manager', value: 'rhsm-conduit' },
      { label: 'Satellite/Discovery', value: 'yupana' },
      { label: 'insights-client not connected', value: '!puptoo' },
    ]);
  });

  it('should create chip', () => {
    const { result } = renderHook(() => useRegisteredWithFilter());
    const [, , , setValue] = result.current;

    act(() => {
      setValue(['puptoo']);
    });
    const [filter, chip, registeredWithValue] = result.current;
    expect(registeredWithValue).toMatchObject(['puptoo']);
    expect(filter.filterValues.value.length).toBe(1);
    expect(chip).toMatchObject([
      {
        category: 'Data collector',
        chips: [{ name: 'insights-client', value: 'puptoo' }],
        type: 'registered_with',
      },
    ]);
  });
});
