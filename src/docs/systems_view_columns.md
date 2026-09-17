- [columns](#columns)
  - [Example](#example)

# columns

`columns` is a `ColumnSelector`: a function that receives the shared column catalog and returns bound columns for this table.

Omit it and the table has **no columns** (`defaultColumnSelector`).

Use a stable reference. The selector is resolved once from that reference; an inline function in JSX will recreate columns every render.

## Example

```ts
  //TODO
```