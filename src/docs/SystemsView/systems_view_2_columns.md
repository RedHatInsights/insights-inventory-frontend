# Columns

`columns` expects a selector function. SystemsView calls it with a predefined list of columns called `catalog`. You can pick the columns you want and tell each one how to read your row data.

Keep this function stable in its own file and prevent unnecessary re-renders.

## Bind a shared column to your row

The columns on `catalog` are predefined and meant to be shared. Inventory already chose the header and the cell. Some columns also have a default sort name. Name, Workspace, OS, Status, and Last seen do. Tags, Infrastructure, Vendor, Workload, and Created do not. Every app that picks `catalog.name` gets that same Name cell. 

Because your rows are not inventory's rows. The shared cell cannot guess that your display name lives at `attributes.display_name`, or that your API sorts workspaces by `groups`. Binding is the object param you pass so the shared column can understand your row and sort with your API's field name.

Each shared column takes that object as its only argument: `catalog.name(binding)`. The fields are:

- `getValue(item)` is required. `item` is one row returned from `fetchData`. Return the value the shared cell accepts. The shapes are listed after the example. 
- `sortBy` is optional. It is the sort field your API expects when the user sorts this column. The table sends that string to `fetchData` as `sortBy`. See [Fetching]{@tutorial systems_view_1_fetching}. If you omit it and the shared column has a default sort name, the column keeps that name, such as `last_check_in` for Last seen. Pass `sortBy` when your API uses a different name. If the shared column has no default, such as Tags, the column stays unsorted unless you pass `sortBy` on the binding.

Patch's advisory row keeps system fields under `attributes`, and its API sorts by names like `groups` and `last_upload`. The function below passes a binding for each shared column. `AdvisorySystem` is that row type.

```tsx
import type { OperatingSystemValue, SystemsViewProps } from './SystemsView';
import type { AdvisorySystem } from './types';

type AdvisorySystemsColumns = SystemsViewProps<AdvisorySystem>['columns'];

const toOperatingSystemValue = (os?: string, rhsm?: string): OperatingSystemValue => {
  const match = os?.match(/^(RHEL|CentOS Linux|CentOS) (\d+)\.(\d+)$/);
  if (!match) {
    return { name: os, rhsm };
  }

  return {
    name: match[1],
    major: Number(match[2]),
    minor: Number(match[3]),
    rhsm,
  };
};

const columns: AdvisorySystemsColumns = (catalog) => [
  catalog.name({
    getValue(item) {
      return {
        id: item.id,
        displayName: item.attributes?.display_name,
      };
    },
  }),
  catalog.workspace({
    sortBy: 'groups',
    getValue(item) {
      return item.attributes?.groups;
    },
  }),
  catalog.tags({
    getValue: (item) => ({
      id: item.id,
      display_name: item.attributes?.display_name,
      tags: item.attributes?.tags,
    }),
  }),
  catalog.os({
    sortBy: 'os',
    getValue: (item) => toOperatingSystemValue(item.attributes?.os, item.attributes?.rhsm),
  }),
  catalog.lastSeen({
    sortBy: 'last_upload',
    getValue: (item) => ({
      lastSeen: item.attributes?.last_upload,
      // Patch's advisory API keeps its own timestamp field name.
      culled: item.attributes?.culled_timestamp,
      staleWarning: item.attributes?.stale_warning_timestamp,
      stale: item.attributes?.stale_timestamp,
    }),
  }),
];

export default columns;
```

What each of those columns expects:

- `name` accepts `{ id, displayName }`. `displayName` is the text of the link. It also accepts optional `isImageBased` and `isCentosLinux`. `isImageBased` selects the image-mode icon. `isCentosLinux` shows the CentOS conversion indicator.
- `workspace` accepts a list of `{ id, name }`. Patch sorts it by `groups`, not by `workspace`.
- `tags` accepts `{ id, display_name, tags }`. Point it at the tags already on your row. Tags has no default sort name. The example leaves `sortBy` off, so that column cannot be sorted.
- `os` accepts `{ name, major, minor, rhsm }`. Patch's API returns one string, `RHEL 8.2`, so `toOperatingSystemValue` splits it. If your row already has `name`, `major`, and `minor`, return that object and skip the split.
- `lastSeen` accepts `{ lastSeen, culled, staleWarning, stale }`. Those are date strings. It also accepts optional `perReporterStaleness`, which shows the disconnected indicator. Patch sorts this column by `last_upload`.

## Custom columns

Use `catalog.custom` when the list has no column you need. A shared column call like `catalog.name(binding)` has only one param, because Inventory already provides the column spec: the header, the cell, and, when the column is sortable, the default sort name. A new custom column has no spec yet, so you pass two arguments: your spec, then the same binding object a shared column takes.

```tsx
catalog.custom(spec, binding);
```

The spec describes the column:

- `key` is required. It identifies the column.
- `title` is required. It is the header text.
- `renderCell(value)` is required. Inventory calls it with whatever `getValue` returned. You draw the cell here.
- `appName` is required. It is the Insights app that owns the column: `advisor`, `compliance`, `inventory`, `malware`, `content`, `remediations`, `vulnerability`, or `tag`.
- `sortBy` is optional. It is the default sort field for this column. The binding's `sortBy` replaces it when your API uses a different name.

The binding is the same object as for a shared column. `getValue(item)` is required and reads your row. `sortBy` on the binding replaces the spec's `sortBy`. Omit both and the custom column cannot be sorted.

Patch adds a Template column this way. The first object is the spec, including `renderCell`. The second object is the binding. The cell is a link when the row has a template, and plain text when it does not.

```tsx
catalog.custom(
  {
    key: 'template_name',
    title: 'Template',
    appName: 'content',
    sortBy: 'template_name',
    renderCell: (value) =>
      value.name ? <a href={`/templates/${value.uuid}`}>{value.name}</a> : 'No template',
  },
  {
    getValue: (item) => ({
      name: item.attributes?.template_name,
      uuid: item.attributes?.template_uuid,
    }),
  },
);
```

A text column is the same idea. `renderCell` returns the string `getValue` read from the row.

```tsx
catalog.custom(
  {
    key: 'status',
    title: 'Status',
    appName: 'content',
    sortBy: 'status',
    renderCell: (value) => value,
  },
  {
    getValue: (item) => item.attributes?.status,
  },
);
```
