/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'problem', // or 'warning'
    docs: {
      description:
        'Disallow the use of the deprecated InventoryTable component',
      recommended: true,
    },
  },
  create(context) {
    return {
      JSXOpeningElement(node) {
        if (node.name.name === 'InventoryTable') {
          context.report({
            node,
            message:
              'The InventoryTable component is deprecated and should not be used. Consider the SystemsTable alternative.',
          });
        }
      },
    };
  },
};
