import path from 'path';
import { randomUUID } from 'crypto';

// Global setting constants
export const RUN_ID = process.env.TEST_RUN_ID || 'local-run';
export const MANIFEST_PATH = path.join(
  'host_archives',
  `cleanup-manifest-${RUN_ID}.json`,
);
export const GLOBAL_DATA_PATH = path.resolve(
  __dirname,
  `../.global-data-${RUN_ID}.json`,
);

// Base archives
export const CENTOS_ARCHIVE = 'centos79.tar.gz';
export const BOOTC_ARCHIVE = 'image-mode-rhel94.tar.gz';
export const EDGE_ARCHIVE = 'edge-hbi-ui-stage.tar.gz';
export const PACKAGE_BASED_ARCHIVE = 'rhel94_core_collect.tar.gz';

// Hosts searching constants
export const DEFAULT_PREFIX = 'insights-pw-vm';
export const DELETE_HOSTS_PREFIX = `delete-${randomUUID()}`;

/**
 * Pre-requisite: Manually created 7 workspaces in stage/prod environment:
 * These workspaces will be reused across test runs and should NOT be deleted.
 * Recreate these workspaces in case workpsaces were removed.
 */
const WORKSPACE_SORT_NAME_ALPHA = 'sort_name_Alpha';
const WORKSPACE_SORT_NAME_BRAVO = 'sort_name_Bravo';
const WORKSPACE_SORT_NAME_CHARLIE = 'sort_name_Charlie';
const WORKSPACE_SORT_MODIFIED_FIRST = 'sort_modified_First';
const WORKSPACE_SORT_MODIFIED_SECOND = 'sort_modified_Second';
const WORKSPACE_SORT_MODIFIED_THIRD = 'sort_modified_Third';
export const WORKSPACE_WITH_SYSTEMS = 'Workspace_with_systems';

// Unique workspace introduced by Kessel/Management Fabric team
export const WORKSPACE_UNGROUPED_HOSTS = 'Ungrouped Hosts';

export const WORKSPACE_NAME_SORT_PREFIX = 'sort_name';
export const WORKSPACE_NAME_MODIFIED_PREFIX = 'sort_modified';

// Base archive tags details: rhel94_core_collect.tar.gz has always 7 tags
export const BASE_ARCHIVE_TAG_COUNT = 7;
export const TAG = {
  name: 'Location',
  value: 'basement',
  tagSource: 'insights-client',
};
