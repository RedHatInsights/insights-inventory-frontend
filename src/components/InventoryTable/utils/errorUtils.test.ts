import '@testing-library/jest-dom';
import { expect } from '@jest/globals';
import { DEFAULT_DELETE_ERROR_MESSAGE } from '../../../constants';
import { getDeleteErrorDescription } from './errorUtils';

describe('getDeleteErrorDescription', () => {
  it('displays API error detail when delete fails (axios-style error)', () => {
    const axiosError = {
      response: {
        data: {
          detail: 'Host is not eligible for removal from inventory.',
        },
      },
    };
    expect(getDeleteErrorDescription(axiosError)).toBe(
      'Host is not eligible for removal from inventory.',
    );
  });

  it('returns error detail from response.data.detail when present', () => {
    const error = {
      response: {
        data: {
          detail: 'Custom validation failed',
        },
      },
    };
    expect(getDeleteErrorDescription(error)).toBe('Custom validation failed');
  });

  it('returns default message when error has no detail', () => {
    expect(getDeleteErrorDescription(null)).toBe(DEFAULT_DELETE_ERROR_MESSAGE);
    expect(getDeleteErrorDescription(undefined)).toBe(
      DEFAULT_DELETE_ERROR_MESSAGE,
    );
    expect(getDeleteErrorDescription({})).toBe(DEFAULT_DELETE_ERROR_MESSAGE);
    expect(getDeleteErrorDescription({ response: {} })).toBe(
      DEFAULT_DELETE_ERROR_MESSAGE,
    );
  });

  it('uses first element when given array of responses', () => {
    const responses = [
      { data: { detail: 'First batch failed' } },
      { data: { detail: 'Second batch failed' } },
    ];
    expect(getDeleteErrorDescription(responses)).toBe('First batch failed');
  });
});
