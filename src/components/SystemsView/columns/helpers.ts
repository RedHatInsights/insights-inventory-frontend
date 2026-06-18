import { NOT_AVAILABLE } from '../../../constants';

export const valueOrNotAvailable = <T>(value: T) =>
  value != null && value !== '' ? value : NOT_AVAILABLE;
