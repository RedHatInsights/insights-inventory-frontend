import { calculateFilters } from './Utilities';

describe('calculateFilters', () => {
  it('should returns a mutated SearchParams for filters', () => {
    const searchParams = new URLSearchParams(location.search);

    expect(calculateFilters(searchParams, []).toString()).toEqual('');
  });
  it('should returns a mutated SearchParams for filters', () => {
    const searchParams = new URLSearchParams(location.search);

    expect(calculateFilters(searchParams, []).toString()).toEqual('');
  });
});
