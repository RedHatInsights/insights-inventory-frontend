- [filters](#filters)
  - [Example](#example)

# filters

`filters` is a `FilterSelector`: a function that receives the shared filter catalog and returns bound toolbar filters for this table.

Omit it and the toolbar has **no filters** (`defaultFilterSelector`).

Use a stable reference, not an inline function in JSX.

Unlike InventoryTable `hideFilters`, unused filters are simply left out of the selector.

## Example

```ts
  //TODO
```
