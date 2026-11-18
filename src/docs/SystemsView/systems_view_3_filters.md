# Filters

`filters` is a selector function. SystemsView calls it with the filters it already knows how to render. The list of filters is called `catalog`. You pick the filters you want, bind them and SystemsView renders the control and syncs URL params. You only specify how that filter value will look in API query.

Keep this function stable in its own file and prevent unnecessary re-renders.

## Bind a shared filter to your query

This works the similar way as a [column binding]{@tutorial systems_view_2_columns}. A shared column takes one binding so it can read your row. A shared filter takes one binding so it can write your API query. Inventory already owns the control: the label, the input, and the choices. `catalog.hostname(binding)` does not ask you to render that input.

Your query is not inventory's query. The hostname control cannot guess that your API calls that field `search`, or that it wants `RHEL 8.2` instead of `RHEL8.2`. The binding is the object you pass so the toolbar value becomes a field on your query.

Each shared filter takes that object as its only argument. The fields are:

- `updateFilterParams(params, value)` is required. It plays similar role as `getValue` does on a column. `params` is the query so far. It starts as `{}`. `value` is option, which user picked. Return the next query. Leave a field off when nothing is selected, so you do not send an empty filter. `fetchData` later receives this query as `filterParams`, not the raw toolbar state. See [Fetching]{@tutorial systems_view_1_fetching}.
- `filterProps` is optional. It passes extra settings to that shared control. For instance Patch hides CentOS in the operating system list with `showCentosOptions: false`.

Patch's API does not use the SystemsView's names. Hostname is sent as `search`. Operating system values arrive as `RHEL8.2` and must be sent as `RHEL 8.2`. Tags are sent only when some are selected. If your API wants those tag strings in a different form, change `value` before you assign it. `AdvisoryFilterParams` is that query type.

```tsx
import type { SystemsViewProps } from './SystemsView';
import type { AdvisoryFilterParams, AdvisorySystem } from './types';

type AdvisorySystemsFilters = SystemsViewProps<AdvisorySystem, AdvisoryFilterParams>['filters'];

/** The toolbar stores `RHEL8.2`. Patch expects `RHEL 8.2`. */
const toPatchOsValue = (token: string) => {
  const match = token.match(/^(.+?)(\d+\.\d+)$/);
  return match ? `${match[1]} ${match[2]}` : token;
};

const filters: AdvisorySystemsFilters = (catalog) => [
  catalog.hostname({
    updateFilterParams(params, value) {
      if (!value) {
        return params;
      }

      return { ...params, search: value };
    },
  }),
  catalog.operatingSystem({
    filterProps: {
      showCentosOptions: false,
    },
    updateFilterParams(params, value) {
      const restFilter = { ...params.filter };
      delete restFilter.os;

      return {
        ...params,
        filter:
          value.length > 0
            ? { ...restFilter, os: value.map(toPatchOsValue).join(',') }
            : restFilter,
      };
    },
  }),
  catalog.tags({
    updateFilterParams(params, value) {
      const rest = { ...params };
      delete rest.selectedTags;

      return value.length > 0 ? { ...rest, selectedTags: value } : rest;
    },
  }),
];

export default filters;
```

If your API already uses the names above, write those names and skip the renaming. The operating system example is the pattern: read `value`, change it if you must, and omit the field when the list is empty.

## A filter of your own

Use `catalog.custom` when the list has no filter you need. It takes the same two arguments as a custom column: `catalog.custom(spec, binding)`. SystemsView has no spec for it, so you pass the spec first and the binding second. The spec describes the control. The binding maps its value onto your query.

Patch adds a status checkbox. The options are `{ label, value }` pairs from the app. The function removes the previous status before it writes the next one, so an empty selection does not keep the old value.

```tsx
catalog.custom(
  {
    type: 'checkbox',
    filterId: 'status',
    title: 'Status',
    defaultValue: [],
    placeholder: 'Filter by status',
    options: advisoryStatuses,
  },
  {
    updateFilterParams(params, value) {
      const restFilter = { ...params.filter };
      delete restFilter.status;

      return {
        ...params,
        filter: value.length > 0 ? { ...restFilter, status: value } : restFilter,
      };
    },
  },
);
```

`type` can be `text`, `checkbox`, or `single-select`. A text filter uses a string `defaultValue`. Checkbox and single-select use an array, and they need `options`. On a text filter, set `debounceMs` to wait until the user stops typing before the table reloads.

## Other built-in filters

You map these the same way. Each line is the `value` you receive.

- `status` is a list of strings: `fresh`, `stale`, or `stale_warning`.
- `source` is a list of strings, such as `puptoo` or `satellite`.
- `systemType` is a list of strings: `conventional` or `image`.
- `workspace` is a list of workspace ids.
- `workloads` is a list of strings, such as `sap` or `ansible`.
- `lastSeen` is `{ key, range }`. `key` is the choice from the list, such as `last24` or `7more`, or `''` when nothing is selected. For a custom range, `key` is `custom` and `range` is `{ start, end }`. Otherwise `range` is `null`.
