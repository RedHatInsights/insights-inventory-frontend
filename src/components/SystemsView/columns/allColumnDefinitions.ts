import { ColumnManagementModalColumn } from '@patternfly/react-component-groups';
import inventoryColumns from './inventory/columnDefinitions';
import complianceColumns from './compliance/columnDefinitions';
import { System } from '../hooks/useSystemsQuery';
import { Resolve } from '../../../types/utility-types';
import advisorColumns from './advisor/columnDefinitions';
import remediationPlansColumns from './remediations/columnDefinitions';
import malwareColumns from './malware/columnDefinitions';

type RenderableColumn = {
  /** Cell content for a single system row in the Systems table. */
  readonly renderCell: (system: System) => React.ReactNode;
};

type SortableColumn = {
  /** Used when this column is the active sort; omit for non-sortable columns. */
  readonly sortBy?: string;
};

export type Column = Resolve<
  ColumnManagementModalColumn & RenderableColumn & SortableColumn
>;

/**
 * Default Systems View columns, merged in order from each integrated app.
 *
 * To add an app: import its `./<appId>/columnDefinitions` default export and append
 * with `...thatAppsColumns` (or insert where the column order should appear).
 */
const allColumns = [
  ...inventoryColumns,
  ...advisorColumns,
  ...malwareColumns,
  ...complianceColumns,
  ...remediationPlansColumns,
] as const satisfies readonly Column[];

export default allColumns;
