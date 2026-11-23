# Getting started

SystemsView is a successor to legacy InventoryTable. It draws the table, the toolbar, the pager, and the column headers while consumers can load the data for rows from their own API.

## Load the table

Currently we ship it as federated module. Consumers can load it the same way Patch loads it for an advisory. Loading is done via `AsyncComponent`. The spinner shows until that module is ready.

```tsx
import React from 'react';
import { Spinner } from '@patternfly/react-core';
import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import type { SystemsViewProps } from './SystemsView';
import columns from './columns';
import filters from './filters';

type AdvisorySystemsViewProps = SystemsViewProps<AdvisorySystem, AdvisoryFilterParams>;

const AdvisorySystems = ({ advisoryName }: { advisoryName: string }) => (
  <AsyncComponent<AdvisorySystemsViewProps>
    scope="inventory"
    module="./SystemsView"
    fallback={<Spinner size="lg" />}
    queryKeyPrefix={advisoryName}
    fetchData={fetchAdvisorySystems}
    columns={columns}
    filters={filters}
  />
);
```

The TypeScript types come from the generated `SystemsView` file. `SystemsViewProps<Row, FilterParams>` is the prop type. `Row` is one system from your API. `FilterParams` is the query object your API expects. `fetchAdvisorySystems`, `columns`, and `filters` are written on the next pages.

## Copy the TypeScript contract

The public types are not published as a package yet. Until they are, you generate the declaration file in this repo and copy it into your app by hand.

1. Check out [insights-inventory-frontend](https://github.com/RedHatInsights/insights-inventory-frontend) at the commit your environment loads.
2. Use the Node version in `.nvmrc`, then install dependencies with `npm ci`.
3. Generate the contract:

```sh
npm run type-gen
```

That writes one file, `dist/SystemsView.d.ts`. It holds `SystemsViewProps` and the column, filter, and fetch types the table exposes.

4. Copy `dist/SystemsView.d.ts` into your app, next to the component that loads the table, and keep the name `SystemsView.d.ts`. The import in the example above resolves to that file:

```tsx
import type { SystemsViewProps } from './SystemsView';
```

5. Generate and copy again when you move to a newer inventory build. The file in your app is a snapshot. It does not update on its own.

## The table does not know your API

The table always speaks the same way. Your API can use different page numbers, field names, and query shapes. You translate these in three places:

- Paging and sort, inside `fetchData`. See [Fetching]{@tutorial systems_view_1_fetching}.
- Each column, with `getValue` and `sortBy`. See [Columns]{@tutorial systems_view_2_columns}.
- Each filter, with `updateFilterParams`. See [Filters]{@tutorial systems_view_3_filters}.

## Mandatory Props you pass

You must pass four props:

- `queryKeyPrefix` is a name for this table's data. Patch uses the advisory name, so each advisory loads its own systems.
- `fetchData` loads one page of rows.
- `columns` chooses what each row shows.
- `filters` turns toolbar choices into your API query.

Leave `queryClient` out unless your app needs to share queried data from this table with components outside. This is a substitute for Redux store.

## Keep columns and filters in their own files and stable

Define select functions for both `columns` and `filters` in their own files, then import them inside the component A new function on every render makes the table reload more often than it should.
