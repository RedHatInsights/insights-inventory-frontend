import { DataViewTrObject } from '@patternfly/react-data-view';
import { StructuredTag } from '@redhat-cloud-services/host-inventory-client';

export type TagTuple = [string, string, string];

/**
 * Builds the tags filter token for a table row (namespace/key=value).
 *  @param row - Tuple key, value, namespace (matches TagsFilter shape).
 *  @returns   Filter token string for Toolbar and API.
 */
export const tagTupleToFilterStr = (row: TagTuple): string => {
  const [key, value, namespace] = row;
  return `${namespace}/${key}=${value}`;
};

const cellToString = (cell: unknown): string => {
  if (
    typeof cell === 'string' ||
    typeof cell === 'number' ||
    typeof cell === 'boolean'
  ) {
    return String(cell);
  }
  return '';
};

/**
 * Normalizes a selection row (TagTuple or DataViewTrObject from PatternFly) to TagTuple.
 *  @param item - Tag tuple array or DataView row object
 *  @returns    Three string cells, or null if the shape is not recognized
 */
export const normalizeToTagTuple = (item: unknown): TagTuple | null => {
  if (Array.isArray(item) && item.length === 3) {
    return [
      cellToString(item[0]),
      cellToString(item[1]),
      cellToString(item[2]),
    ];
  }
  if (item && typeof item === 'object' && 'row' in item) {
    const r = (item as DataViewTrObject).row;
    if (Array.isArray(r) && r.length >= 3) {
      return [cellToString(r[0]), cellToString(r[1]), cellToString(r[2])];
    }
  }
  return null;
};

/**
 * Compares two tag row items (TagTuple or DataViewTrObject) by all three tuple cells.
 *  @param a - First row or tuple
 *  @param b - Second row or tuple
 *  @returns True when all three cells match with strict equality
 */
export const matchTagRowItems = (a: unknown, b: unknown): boolean => {
  const ta = normalizeToTagTuple(a);
  const tb = normalizeToTagTuple(b);
  if (!ta || !tb) {
    return false;
  }
  return ta[0] === tb[0] && ta[1] === tb[1] && ta[2] === tb[2];
};

/**
 * Maps a selection entry to the toolbar/API filter token string.
 *  @param item - Tag tuple or DataView row object
 *  @returns    Filter token, or empty string if not normalizable
 */
export const selectionItemToFilterStr = (item: unknown): string => {
  const tuple = normalizeToTagTuple(item);
  return tuple ? tagTupleToFilterStr(tuple) : '';
};

export const filterStrToTagTuple = (token: string): TagTuple => {
  const slash = token.indexOf('/');
  const namespace = slash >= 0 ? token.slice(0, slash) : '';
  const rest = slash >= 0 ? token.slice(slash + 1) : token;
  const eq = rest.indexOf('=');
  const key = eq >= 0 ? rest.slice(0, eq) : rest;
  const value = eq >= 0 ? rest.slice(eq + 1) : '';
  return [key, value, namespace];
};

/**
 * Seeds `useDataViewSelection` from toolbar tag filter tokens (namespace/key=value).
 *  @param tokens - Tag filter strings in toolbar/API shape.
 *  @returns      Tag tuples for initial selection state.
 */
export const filterStrsToSelectedTagTuples = (tokens: string[]): TagTuple[] =>
  tokens.map(filterStrToTagTuple);

export const tagToTagTuple = (tag: StructuredTag): TagTuple => {
  return [tag.key ?? '', tag.value ?? '', tag.namespace ?? ''];
};

export const noopSelection = {
  selected: [],
  setSelected: () => {},
  onSelect: () => {},
  isSelected: () => false,
};
