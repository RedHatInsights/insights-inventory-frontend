import { loadEntities } from '../store/inventory-actions';
import {
  HOST_GROUP_CHIP,
  RHCD_FILTER_KEY,
  UPDATE_METHOD_KEY,
} from './constants';
export const subtractWeeks = (numOfWeeks, date = new Date()) => {
  date.setDate(date.getDate() - numOfWeeks * 7);

  return date;
};

export const verifyCollectorStaleness = (reporterStaleness) => {
  const stalenessDate = new Date(reporterStaleness.stale_timestamp);
  const currentDateTime = new Date();

  const twoWeeksPeriod = subtractWeeks(2);
  const oneWeeksPeriod = subtractWeeks(1);

  if (stalenessDate > currentDateTime) {
    return 'Fresh';
  } else if (
    oneWeeksPeriod < stalenessDate &&
    stalenessDate < currentDateTime
  ) {
    return 'Stale';
  } else if (twoWeeksPeriod < stalenessDate && stalenessDate < oneWeeksPeriod) {
    return 'Stale warning';
  } else {
    return 'Culled';
  }
};

export const verifyCulledReporter = (perReporterStaleness, reporter) => {
  //TODO: get rid of !perReporterStaleness condition when dependant apps have per_reporter_staleness info
  if (!perReporterStaleness) {
    return false;
  } else if (perReporterStaleness[reporter]) {
    return (
      verifyCollectorStaleness(perReporterStaleness[reporter]) === 'Culled'
    );
  } else {
    return true;
  }
};

export const loadSystems = (options, showTags, getEntities) => {
  const limitedItems =
    options?.items?.length > options.per_page
      ? options?.items?.slice(
          (options?.page - 1) * options.per_page,
          options?.page * options.per_page
        )
      : options?.items;

  const config = {
    ...(options.hasItems && {
      sortBy: options?.sortBy?.key,
      orderDirection: options?.sortBy?.direction?.toUpperCase(),
    }),
    ...options,
    filters: options?.filters || options?.activeFilters,
    orderBy: options?.orderBy || options?.sortBy?.key,
    orderDirection:
      options?.orderDirection?.toUpperCase() ||
      options?.sortBy?.direction?.toUpperCase(),
    ...(limitedItems?.length > 0 && {
      itemsPage: options?.page,
      page: 1,
    }),
  };

  return loadEntities(limitedItems, config, { showTags }, getEntities);
};

export const tagsMapper = (acc, curr) => {
  let [namespace, keyValue] = curr.split('/');
  if (!keyValue) {
    keyValue = namespace;
    namespace = null;
  }

  const [key, value = null] = keyValue.split('=');
  const currTagKey = acc.findIndex(({ category }) => category === namespace);
  const currTag = acc[currTagKey] || {
    category: namespace,
    key: namespace,
    type: 'tags',
    values: [],
  };
  currTag.values.push({
    name: `${key}${value ? `=${value}` : ''}`,
    key: `${key}${value ? `=${value}` : ''}`,
    tagKey: key,
    value,
    group: {
      label: namespace,
      value: namespace,
      type: 'checkbox',
    },
  });
  if (!acc[currTagKey]) {
    acc.push(currTag);
  }

  return acc;
};

export const getSearchParams = (location) => {
  const searchParams = new URLSearchParams(location.search);
  const status = searchParams.getAll('status');
  const source = searchParams.getAll('source');
  const filterbyName = searchParams.getAll('hostname_or_id');
  const tagsFilter = searchParams
    .getAll('tags')?.[0]
    ?.split?.(',')
    .reduce?.(tagsMapper, []);
  const operatingSystem = searchParams.getAll('operating_system');
  const rhcdFilter = searchParams.getAll(RHCD_FILTER_KEY);
  const updateMethodFilter = searchParams.getAll(UPDATE_METHOD_KEY);
  const hostGroupFilter = searchParams.getAll(HOST_GROUP_CHIP);
  const page = searchParams.getAll('page');
  const perPage = searchParams.getAll('per_page');
  const lastSeenFilter = searchParams.getAll('last_seen');
  return {
    status,
    source,
    tagsFilter,
    filterbyName,
    operatingSystem,
    rhcdFilter,
    updateMethodFilter,
    lastSeenFilter,
    page,
    perPage,
    hostGroupFilter,
  };
};
