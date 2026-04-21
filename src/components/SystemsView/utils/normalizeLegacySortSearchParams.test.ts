import { expect } from '@jest/globals';
import { SORT_DIR_URL_PARAM, SORT_URL_PARAM } from '../constants';
import { normalizeLegacySortSearchParams } from './normalizeLegacySortSearchParams';

const systemsViewSortParams = {
  sortParam: SORT_URL_PARAM,
  directionParam: SORT_DIR_URL_PARAM,
} as const;

describe('normalizeLegacySortSearchParams', () => {
  it('expands legacy descending sort (leading dash)', () => {
    const params = new URLSearchParams(
      `${SORT_URL_PARAM}=-last_check_in&page=1`,
    );
    const next = normalizeLegacySortSearchParams(params, systemsViewSortParams);
    expect(next.get(SORT_URL_PARAM)).toBe('last_check_in');
    expect(next.get(SORT_DIR_URL_PARAM)).toBe('desc');
    expect(next.get('page')).toBe('1');
  });

  it('expands no hyphen as ascending', () => {
    const params = new URLSearchParams(`${SORT_URL_PARAM}=display_name`);
    const next = normalizeLegacySortSearchParams(params, systemsViewSortParams);
    expect(next.get(SORT_URL_PARAM)).toBe('display_name');
    expect(next.get(SORT_DIR_URL_PARAM)).toBe('asc');
  });

  it('expands only leading hyphen as desc', () => {
    const params = new URLSearchParams(`${SORT_URL_PARAM}=display-name`);
    const next = normalizeLegacySortSearchParams(params, systemsViewSortParams);
    expect(next.get(SORT_URL_PARAM)).toBe('display-name');
    expect(next.get(SORT_DIR_URL_PARAM)).toBe('asc');
  });

  it('returns two-param sort URLs unchanged', () => {
    const params = new URLSearchParams(
      `${SORT_URL_PARAM}=display_name&${SORT_DIR_URL_PARAM}=desc`,
    );
    const next = normalizeLegacySortSearchParams(params, systemsViewSortParams);
    expect(next.get(SORT_URL_PARAM)).toBe('display_name');
    expect(next.get(SORT_DIR_URL_PARAM)).toBe('desc');
  });

  it('returns URLs without sort unchanged', () => {
    const params = new URLSearchParams('page=2');
    const next = normalizeLegacySortSearchParams(params, systemsViewSortParams);
    expect(next.get(SORT_URL_PARAM)).toBeNull();
    expect(next.get(SORT_DIR_URL_PARAM)).toBeNull();
    expect(next.get('page')).toBe('2');
    expect(next).not.toBe(params);
  });

  it('works with custom param names', () => {
    const params = new URLSearchParams('order=-hostname');
    const next = normalizeLegacySortSearchParams(params, {
      sortParam: 'order',
      directionParam: 'order_how',
    });
    expect(next.get('order')).toBe('hostname');
    expect(next.get('order_how')).toBe('desc');
    expect(next.has(SORT_DIR_URL_PARAM)).toBe(false);
  });
});
