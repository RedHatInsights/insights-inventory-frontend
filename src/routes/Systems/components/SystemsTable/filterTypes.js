import Workspace from './components/filters/Workspace';

export const workspace = {
  Component: Workspace,
  chips: (value) => [value],
  selectValue: (value) => [value, true],
  deselectValue: () => [undefined, true],
};

/**
 *
 * Default set of filter types to provide
 *
 */
export default {
  workspace,
};
