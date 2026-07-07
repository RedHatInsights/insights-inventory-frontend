import { NOT_AVAILABLE } from './CellValue';

export const valueOrNotAvailable = <T>(value: T) =>
  value != null && value !== '' ? value : NOT_AVAILABLE;
