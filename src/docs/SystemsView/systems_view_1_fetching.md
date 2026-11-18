# Fetching

The table cannot show rows until you give it `fetchData` to obtain data. SystemsView calls that function when the page, the page size, the sort, or the filters state change. Rest of this document describes what `fetchData` function should look like.

## What you receive

`fetchData` receives object with SystemsView's internal state:

- `page` and `perPage` start at 1. They are the same numbers the user sees in the pager.
- `sortBy` is the sort name from the column the user clicked. It is missing when the table is not sorted. The table starts sorted by `last_check_in` descending, so the first call usually sends that name. Map it to your own default sort if your API uses a different field.
- `direction` is `asc` or `desc`.
- `filterParams` is the query object your filters built. It is an empty object when nothing is selected. The [Filters]{@tutorial systems_view_3_filters} page is where you shape that object.

## What you return

Return `{ results, total }`.

`results` is the rows for this page. Every row needs an `id`. Leave out rows that do not have one. `total` is the full count, not the length of this page. The pager uses it to know how many pages there are.

## Match your API

The table always gives you `page`, `perPage`, `sortBy`, and `direction`. Your API pagination may work slightly differently or want different names, its up to you to transform these into params your API expects truly.

For instance Patch's advisory API wants `offset`, `limit`, and a sort string with `-` in front when the direction is descending. Page 1 with 20 rows is offset `0` and limit `20`. In the example, `getAdvisorySystems` stands in for that API call.

```tsx
const toApiParams = ({ sortBy, direction, page, perPage, filterParams }) => {
  const sort = `${direction === 'desc' ? '-' : ''}${sortBy ?? ''}`;
  const limit = perPage;
  const offset = page * limit - limit;

  return { sort, offset, limit, ...filterParams };
};

const fetchAdvisorySystems = async (params) => {
  const response = await getAdvisorySystems(advisoryName, toApiParams(params));

  return {
    results: (response.data ?? []).filter(
      (item) => typeof item.id === 'string' && item.id.length > 0,
    ),
    total: response.meta?.total_items ?? 0,
  };
};
```

Change the translation when your API is different. If it already uses `page` and `perPage`, pass those through and skip `offset`. If it wants `sort` and `order` as two fields, send `sortBy` and `direction` separately instead of joining them with `-`. Spread `filterParams` either way. The filters page already named those fields for your API.
