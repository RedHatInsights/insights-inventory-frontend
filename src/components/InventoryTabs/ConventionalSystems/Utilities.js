import flatMap from 'lodash/flatMap';
import {
  HOST_GROUP_CHIP,
  RHCD_FILTER_KEY,
  UPDATE_METHOD_KEY,
} from '../../../Utilities/constants';

const mapTags = ({ category, values }) =>
  values.map(
    ({ tagKey, value }) =>
      `${category ? `${category}/` : ''}${tagKey}${value ? `=${value}` : ''}`
  );

const filterMapper = {
  staleFilter: ({ staleFilter }, searchParams) =>
    staleFilter.forEach((item) => searchParams.append('status', item)),
  osFilter: ({ osFilter }, searchParams) =>
    osFilter?.forEach((item) => searchParams.append('operating_system', item)),
  registeredWithFilter: ({ registeredWithFilter }, searchParams) =>
    registeredWithFilter?.forEach((item) =>
      searchParams.append('source', item)
    ),
  value: ({ value, filter }, searchParams) =>
    value === 'hostname_or_id' &&
    Boolean(filter) &&
    searchParams.append('hostname_or_id', filter),
  tagFilters: ({ tagFilters }, searchParams) =>
    tagFilters?.length > 0 &&
    searchParams.append('tags', flatMap(tagFilters, mapTags)),
  rhcdFilter: ({ rhcdFilter }, searchParams) =>
    rhcdFilter?.forEach((item) => searchParams.append(RHCD_FILTER_KEY, item)),
  lastSeenFilter: ({ lastSeenFilter }, searchParams) =>
    Object.keys(lastSeenFilter || {})?.forEach(
      (item) =>
        item === 'mark' &&
        searchParams.append('last_seen', lastSeenFilter[item])
    ),
  updateMethodFilter: ({ updateMethodFilter }, searchParams) =>
    updateMethodFilter?.forEach((item) =>
      searchParams.append(UPDATE_METHOD_KEY, item)
    ),
  hostGroupFilter: ({ hostGroupFilter }, searchParams) =>
    hostGroupFilter?.forEach((item) =>
      searchParams.append(HOST_GROUP_CHIP, item)
    ),
};

export const calculateFilters = (searchParams, filters = []) => {
  filters.forEach((filter) => {
    Object.keys(filter).forEach((key) => {
      filterMapper?.[key]?.(filter, searchParams);
    });
  });
  return searchParams;
};

export const calculatePagination = (searchParams, page, perPage) => {
  const currSearch = new URLSearchParams(location.search);
  const newPage = page !== undefined ? page : currSearch.get('page');
  const newPerPage =
    perPage !== undefined ? perPage : currSearch.get('per_page');
  !isNaN(parseInt(newPage)) && searchParams.append('page', newPage);
  !isNaN(parseInt(newPerPage)) && searchParams.append('per_page', newPerPage);
};
