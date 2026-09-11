- [SystemsView](#systemsview)
  - [Loading the federated module](#loading-the-federated-module)
  - [Minimal example](#minimal-example)

# SystemsView

Federated systems table for downstream apps. It owns pagination, sort, toolbar filters, and column management. The consumer supplies data (`fetchData`), columns, and filters.

This is the replacement for [InventoryTable](inventory.md) for new consumers.

Public props are documented on `SystemsViewProps` in `src/modules/SystemsView.tsx` (TSDoc). These pages are usage only: [fetchData](systems_view_fetch_data.md), [columns](systems_view_columns.md), [filters](systems_view_filters.md).

## Loading the federated module

The module is exposed as `inventory/SystemsView`.

```tsx
```

## Minimal example

```tsx
```

Keep `columns` and `filters` as stable references (module-level functions), not inline arrows in JSX.
