# Playwright E2E Tests

This directory contains end-to-end tests for Inventory Frontend.

## Test tags

Playwright tags allow selective test execution. Tests are tagged using `{ tag: ['@tag-name'] }` in `test.describe()`. CI workflows use `--grep` and `--grep-invert` to run specific subsets based on feature flags.

| Tag | Purpose | Used in CI |
|-----|---------|------------|
| `@systems-table` | Table component tests | Full Suite, InventoryViews, Legacy Table |
| `@inventory-views` | InventoryViews feature tests | InventoryViews only |
| `@integration` | Federated module tests in downstream apps | Excluded from PR checks |
| `@rbac` | Permission/access control tests | Full Suite, excluded from Prod |

Example:
```typescript
test.describe('System CRUD', { tag: ['@systems-table'] }, () => { ... });
```

## Predefined test data

Tests rely on pre-created workspaces in stage/prod environments. **Do not delete these:**

### Sorting tests
| Workspace | Purpose |
|-----------|---------|
| `sort_name_Alpha`, `sort_name_Bravo`, `sort_name_Charlie` | Name sorting tests |
| `sort_modified_First`, `sort_modified_Second`, `sort_modified_Third` | Last-modified sorting tests |

### Feature tests
| Workspace | Purpose |
|-----------|---------|
| `Workspace_with_systems` | Tests requiring systems in a workspace |

### RBAC tests
| Workspace | Purpose |
|-----------|---------|
| `RBAC_testing_read` | Read-only access workspace |
| `RBAC_testing_read_write` | Read-write access workspace |

If these workspaces are missing or don't contain the expected hosts, tests will fail. Recreate workspaces and add hosts manually in the stage/prod environment.

## RBAC tests

Tests in `rbac/` directory verify permission handling for different user types:

| Test File | User Type | What it verifies |
|-----------|-----------|------------------|
| `test_granular_access.test.ts` | Limited workspace access | User only sees permitted workspaces/systems |
| `test_viewer_role_access.test.ts` | Read-only user | Edit actions are disabled |
| `test_no_access.test.ts` | No Inventory permissions | Proper access-denied messages |

RBAC tests use separate authentication states stored in `.auth/` directory.

Run locally:
```bash
npx playwright test --grep @rbac
```

## Integration tests

Integration tests (`@integration`) verify that the `InventoryTable` federated module loads correctly in downstream applications:

- Advisor (`/insights/advisor/systems`)
- Patch (`/insights/patch/systems`)
- Vulnerability (`/insights/vulnerability/systems`)
- Compliance (`/insights/compliance/systems`)
- Malware (`/insights/malware/systems`)
- Tasks (`/insights/tasks/available/insights-client`)
- Remediations (`/insights/remediations/...`)

These tests require `INTEGRATION=true` and proxy access to external applications.

Run locally:
```bash
npx playwright test --grep @integration
```

## Directory structure

```
_playwright-tests/
├── auth.setup.ts                 # Authentication setup
├── helpers/
│   ├── constants.ts              # Feature flags, workspace names
│   ├── fixtures.ts               # Custom test fixtures
│   ├── filterHelpers.ts          # Table filtering
│   ├── workspaceHelpers.ts       # Workspace CRUD
│   └── navHelpers.ts             # Navigation
├── rbac/
│   ├── constants.ts              # RBAC-specific constants
│   ├── test_granular_access.test.ts
│   ├── test_no_access.test.ts
│   └── test_viewer_role_access.test.ts
├── test_system.test.ts           # System CRUD, export, sorting
├── test_systems_filter.test.ts   # Filter functionality
├── test_workspace.test.ts        # Workspace CRUD
├── test_inventory_views.test.ts  # InventoryViews feature
└── test_integration.test.ts      # Federated module integration
```

## Parallel vs Serial tests

Tests run in parallel by default (4 workers in CI). For tests that modify shared state, use serial mode:

```typescript
test.describe.configure({ mode: 'serial' });
```

Limit workers locally:
```bash
npx playwright test --workers=2
```
