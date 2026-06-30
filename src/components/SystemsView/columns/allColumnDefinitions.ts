import { ColumnManagementModalColumn } from '@patternfly/react-component-groups';
import inventoryColumns from './inventory/columnDefinitions';
import complianceColumns from './compliance/columnDefinitions';
import patchColumns from './content/columnDefinitions';
import { System } from '../hooks/useSystemsQuery';
import { Resolve } from '../../../types/utility-types';
import advisorColumns from './advisor/columnDefinitions';
import vulnerabilityColumns from './vulnerability/columnDefinitions';
import malwareColumns from './malware/columnDefinitions';
import remediationsColumns from './remediations/columnDefinitions';

type RenderableColumn = {
  /** Cell content for a single system row in the Systems table. */
  readonly renderCell: (system: System) => React.ReactNode;
};

type SortableColumn = {
  /** Used when this column is the active sort; omit for non-sortable columns. */
  readonly sortBy?: string;
};

type ConsumerAppColumn = {
  appName:
    | 'advisor'
    | 'compliance'
    | 'inventory'
    | 'malware'
    | 'content'
    | 'remediations'
    | 'vulnerability';
};

type LayoutColumn = {
  /** CSS min-width when inventory views scroll layout is enabled (e.g. '9rem'). */
  readonly minWidth?: string;
};

export type Column = Resolve<
  ColumnManagementModalColumn &
    RenderableColumn &
    SortableColumn &
    ConsumerAppColumn &
    LayoutColumn
>;

/**
 * Default Systems View columns, merged in order from each integrated app.
 *
 * To add an app: import its `./<appId>/columnDefinitions` default export and append
 * with `...thatAppsColumns` (or insert where the column order should appear).
 *
 * `minWidth` is optional on the type. Omitting it lets a column size to content;
 * the sticky Name column falls back to {@link ../utils/columnMinWidths.DEFAULT_NAME_COLUMN_MIN_WIDTH}.
 * Columns in `allColumns` should still define `minWidth` for inventory views scroll layout.
 */
const allColumns = [
  ...inventoryColumns,
  ...patchColumns,
  ...advisorColumns,
  ...vulnerabilityColumns,
  ...malwareColumns,
  ...complianceColumns,
  ...remediationsColumns,
] as const satisfies readonly Column[];

export default allColumns;
