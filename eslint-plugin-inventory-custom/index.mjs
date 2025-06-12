import noDeprecatedInventoryTable from './rules/no-deprecated-inventory-table.mjs';

const plugin = {
  rules: {
    'no-deprecated-inventory-table': noDeprecatedInventoryTable,
  },
};

export default plugin;
