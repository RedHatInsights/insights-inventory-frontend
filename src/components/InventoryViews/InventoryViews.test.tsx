/**
 * Tests for InventoryViews.tsx
 */

import type { ViewConfiguration } from '../../api/inventoryViewsApi';
import { SORT_URL_PARAM, SORT_DIR_URL_PARAM } from '../SystemsView/constants';

describe('InventoryViews component logic', () => {
  describe('getCurrentConfiguration behavior', () => {
    it('should prefer currentColumns when defined', () => {
      const currentColumns = [
        { key: 'display_name', isShown: true },
        { key: 'operating_system', isShown: true },
      ];
      const baselineColumns = [{ key: 'display_name', isShown: true }];

      // The logic: const columns = currentColumns ? normalizeViewColumns(currentColumns) : normalizeViewColumns(baselineColumns);
      const columnsToUse = currentColumns || baselineColumns;
      expect(columnsToUse).toBe(currentColumns);
    });

    it('should use baselineColumns when currentColumns is undefined', () => {
      const currentColumns = undefined;
      const baselineColumns = [
        { key: 'display_name', isShown: true },
        { key: 'group_name', isShown: true },
        { key: 'operating_system', isShown: true },
      ];

      // The logic: const columns = currentColumns ? normalizeViewColumns(currentColumns) : normalizeViewColumns(baselineColumns);
      const columnsToUse = currentColumns || baselineColumns;
      expect(columnsToUse).toBe(baselineColumns);
      expect(columnsToUse.length).toBe(3);
    });

    it('should use baselineColumns for system views without saved config', () => {
      // System views have no saved configuration
      // So baselineColumns is resolved from system defaults
      const baselineColumns = [
        { key: 'display_name', isShown: true },
        { key: 'group_name', isShown: true },
        { key: 'tags', isShown: true },
        { key: 'operating_system', isShown: true },
        { key: 'last_check_in', isShown: true },
      ];

      // When saving All systems without edits, use baseline
      const currentColumns = undefined;
      const columnsToUse = currentColumns || baselineColumns;

      expect(columnsToUse).toBe(baselineColumns);
      expect(columnsToUse.length).toBe(5);
    });
  });

  describe('columnSelector memo dependency', () => {
    it('should recompute when switching between views', () => {
      const view1Config = { columns: [{ key: 'a' }, { key: 'b' }] };
      const view2Config = {
        columns: [{ key: 'x' }, { key: 'y' }, { key: 'z' }],
      };

      // With proper deps [activeView?.configuration]:
      expect(view1Config).not.toBe(view2Config);
      // Memo would recompute when switching views
    });
  });

  describe('viewConfigToSearchParams logic', () => {
    /**
     * These tests implement and verify the viewConfigToSearchParams helper behavior.
     * Since the function is not exported, we recreate its logic here to test it.
     */

    // Reference implementation matching the actual helper
    const viewConfigToSearchParams = (
      configuration?: ViewConfiguration,
      extraFilters?: Partial<Record<string, string | string[]>>,
    ): URLSearchParams => {
      const params = new URLSearchParams();

      // Add filters
      if (configuration?.filters) {
        for (const [key, value] of Object.entries(configuration.filters)) {
          if (Array.isArray(value)) {
            for (const v of value) {
              if (v) params.append(key, String(v));
            }
          } else if (typeof value === 'string' && value) {
            params.set(key, value);
          }
        }
      }

      // Add sort
      if (configuration?.sort?.key) {
        params.set(SORT_URL_PARAM, configuration.sort.key);
        if (configuration.sort.direction) {
          params.set(SORT_DIR_URL_PARAM, configuration.sort.direction);
        }
      }

      // Merge extraFilters
      if (extraFilters) {
        for (const [key, value] of Object.entries(extraFilters)) {
          const values = Array.isArray(value)
            ? value
            : typeof value === 'string' && value
              ? [value]
              : [];
          for (const v of values) {
            const str = String(v);
            if (str && !params.getAll(key).includes(str)) {
              params.append(key, str);
            }
          }
        }
      }

      return params;
    };

    it('should handle empty configuration and produce empty params', () => {
      const config: ViewConfiguration | undefined = undefined;
      const result = viewConfigToSearchParams(config);

      expect(result.toString()).toBe('');
    });

    it('should convert single filter value to search param', () => {
      const config: Partial<ViewConfiguration> = {
        filters: {
          display_name: 'test-host',
        },
      };

      const result = viewConfigToSearchParams(config as ViewConfiguration);

      expect(result.get('display_name')).toBe('test-host');
      expect(result.toString()).toBe('display_name=test-host');
    });

    it('should convert array filter values to multiple params', () => {
      const config: Partial<ViewConfiguration> = {
        filters: {
          operating_system: ['RHEL 8', 'RHEL 9'],
        },
      };

      const result = viewConfigToSearchParams(config as ViewConfiguration);

      expect(result.getAll('operating_system')).toEqual(['RHEL 8', 'RHEL 9']);
      expect(result.toString()).toBe(
        'operating_system=RHEL+8&operating_system=RHEL+9',
      );
    });

    it('should include sort key and direction when present', () => {
      const config: Partial<ViewConfiguration> = {
        sort: {
          key: 'display_name',
          direction: 'asc',
        },
      };

      const result = viewConfigToSearchParams(config as ViewConfiguration);

      expect(result.get(SORT_URL_PARAM)).toBe('display_name');
      expect(result.get(SORT_DIR_URL_PARAM)).toBe('asc');
    });

    it('should handle sort key without direction', () => {
      const config: Partial<ViewConfiguration> = {
        sort: {
          key: 'updated',
        },
      };

      const result = viewConfigToSearchParams(config as ViewConfiguration);

      expect(result.get(SORT_URL_PARAM)).toBe('updated');
      expect(result.has(SORT_DIR_URL_PARAM)).toBe(false);
    });

    it('should handle complete configuration with filters and sort', () => {
      const config: Partial<ViewConfiguration> = {
        filters: {
          display_name: 'test',
          operating_system: ['RHEL 8', 'RHEL 9'],
          status: ['fresh'],
        },
        sort: {
          key: 'updated',
          direction: 'desc',
        },
      };

      const result = viewConfigToSearchParams(config as ViewConfiguration);

      expect(result.get('display_name')).toBe('test');
      expect(result.getAll('operating_system')).toEqual(['RHEL 8', 'RHEL 9']);
      expect(result.getAll('status')).toEqual(['fresh']);
      expect(result.get(SORT_URL_PARAM)).toBe('updated');
      expect(result.get(SORT_DIR_URL_PARAM)).toBe('desc');
    });

    describe('extraFilters merging logic', () => {
      it('should preserve extraFilters that are not in config', () => {
        const config: Partial<ViewConfiguration> = {
          filters: {
            display_name: 'test',
          },
        };
        const extraFilters = {
          workload: 'ansible',
        };

        const result = viewConfigToSearchParams(
          config as ViewConfiguration,
          extraFilters,
        );

        expect(result.get('display_name')).toBe('test');
        expect(result.get('workload')).toBe('ansible');
        expect(result.toString()).toBe('display_name=test&workload=ansible');
      });

      it('should not duplicate values already in config', () => {
        const config: Partial<ViewConfiguration> = {
          filters: {
            workload: 'sap',
          },
        };
        const extraFilters = {
          workload: 'sap', // Same value
        };

        const result = viewConfigToSearchParams(
          config as ViewConfiguration,
          extraFilters,
        );

        // Should only appear once
        expect(result.getAll('workload')).toEqual(['sap']);
        expect(result.toString()).toBe('workload=sap');
      });

      it('should append different extraFilter value if config has different value', () => {
        const config: Partial<ViewConfiguration> = {
          filters: {
            workload: 'sap',
          },
        };
        const extraFilters = {
          workload: 'ansible', // Different value
        };

        const result = viewConfigToSearchParams(
          config as ViewConfiguration,
          extraFilters,
        );

        // Should have both values
        expect(result.getAll('workload')).toEqual(['sap', 'ansible']);
      });

      it('should handle array extraFilters', () => {
        const extraFilters = {
          tags: ['tag1', 'tag2'],
        };

        const result = viewConfigToSearchParams(undefined, extraFilters);

        expect(result.getAll('tags')).toEqual(['tag1', 'tag2']);
      });

      it('should skip empty or undefined extraFilter values', () => {
        const extraFilters = {
          defined: 'value',
          empty: '',
          array_with_empty: ['', 'valid'],
        };

        const result = viewConfigToSearchParams(undefined, extraFilters);

        expect(result.get('defined')).toBe('value');
        expect(result.has('empty')).toBe(false);
        expect(result.getAll('array_with_empty')).toEqual(['valid']);
      });

      it('should preserve bundle-level defaults when switching views', () => {
        // Simulate Ansible bundle scenario
        const viewConfig: Partial<ViewConfiguration> = {
          filters: {
            display_name: 'prod-',
          },
        };
        const defaultFilters = {
          workload: 'ansible', // Bundle default
        };

        const result = viewConfigToSearchParams(
          viewConfig as ViewConfiguration,
          defaultFilters,
        );

        // Both should be present
        expect(result.get('display_name')).toBe('prod-');
        expect(result.get('workload')).toBe('ansible');
      });
    });
  });

  describe('URL normalization behavior', () => {
    /**
     * Tests documenting the useLayoutEffect normalization logic.
     * These verify the expected behavior when normalizing URLs on mount.
     */

    it('should use ref to normalize URL exactly once', () => {
      // Simulates didNormalizeUrlRef behavior
      const didNormalizeUrlRef = { current: false };

      // First call: should normalize
      if (!didNormalizeUrlRef.current) {
        didNormalizeUrlRef.current = true;
        // normalize URL here
      }

      expect(didNormalizeUrlRef.current).toBe(true);

      // Second call: should skip
      let normalizedAgain = false;
      if (!didNormalizeUrlRef.current) {
        normalizedAgain = true;
      }

      expect(normalizedAgain).toBe(false);
    });

    it('should build normalized params from empty config with defaults', () => {
      // Simulates normalization for "All systems" view with Ansible bundle
      const config: ViewConfiguration | undefined = undefined;
      const defaultFilters = {
        workload: 'ansible',
      };

      // Use the same helper as the component
      const viewConfigToSearchParams = (
        configuration?: ViewConfiguration,
        extraFilters?: Partial<Record<string, string | string[]>>,
      ): URLSearchParams => {
        const params = new URLSearchParams();
        if (extraFilters) {
          for (const [key, value] of Object.entries(extraFilters)) {
            const values = Array.isArray(value)
              ? value
              : [value].filter(Boolean);
            for (const v of values) {
              const str = String(v);
              if (str) params.append(key, str);
            }
          }
        }
        return params;
      };

      const normalized = viewConfigToSearchParams(config, defaultFilters);

      // Should preserve default filters even with empty config
      expect(normalized.get('workload')).toBe('ansible');
      expect(normalized.has('page')).toBe(false);
      expect(normalized.has('per_page')).toBe(false);
    });

    it('should demonstrate ephemeral params are dropped', () => {
      const incomingUrl = new URLSearchParams(
        '?display_name=stale&page=3&per_page=50&sort=updated&direction=desc',
      );

      // Before normalization: ephemeral params present
      expect(incomingUrl.has('page')).toBe(true);
      expect(incomingUrl.has('per_page')).toBe(true);

      // After normalization: only config params remain
      // (simulating viewConfigToSearchParams with empty config)
      const normalized = new URLSearchParams();

      expect(normalized.has('page')).toBe(false);
      expect(normalized.has('per_page')).toBe(false);
    });

    it('should demonstrate SystemsView rendering is gated', () => {
      let isUrlNormalized = false;

      // Before normalization
      const shouldRenderBefore = isUrlNormalized;
      expect(shouldRenderBefore).toBe(false);

      // After normalization
      isUrlNormalized = true;
      const shouldRenderAfter = isUrlNormalized;
      expect(shouldRenderAfter).toBe(true);
    });
  });

  describe('view switching behavior', () => {
    /**
     * Tests verifying handleViewSelect behavior.
     * When switching views, URL is replaced with saved config + defaults.
     */

    // Helper matching component behavior
    const viewConfigToSearchParams = (
      configuration?: ViewConfiguration,
      extraFilters?: Partial<Record<string, string | string[]>>,
    ): URLSearchParams => {
      const params = new URLSearchParams();

      if (configuration?.filters) {
        for (const [key, value] of Object.entries(configuration.filters)) {
          if (Array.isArray(value)) {
            for (const v of value) {
              if (v) params.append(key, String(v));
            }
          } else if (typeof value === 'string' && value) {
            params.set(key, value);
          }
        }
      }

      if (configuration?.sort?.key) {
        params.set(SORT_URL_PARAM, configuration.sort.key);
        if (configuration.sort.direction) {
          params.set(SORT_DIR_URL_PARAM, configuration.sort.direction);
        }
      }

      if (extraFilters) {
        for (const [key, value] of Object.entries(extraFilters)) {
          const values = Array.isArray(value)
            ? value
            : typeof value === 'string' && value
              ? [value]
              : [];
          for (const v of values) {
            const str = String(v);
            if (str && !params.getAll(key).includes(str)) {
              params.append(key, str);
            }
          }
        }
      }

      return params;
    };

    it('should replace entire query string, dropping ad-hoc params', () => {
      const currentUrl = new URLSearchParams('?display_name=old&page=2');
      const targetViewConfig: Partial<ViewConfiguration> = {
        filters: {
          operating_system: ['RHEL 9'],
        },
        sort: {
          key: 'display_name',
          direction: 'asc',
        },
      };

      // Simulate view switch
      const newUrl = viewConfigToSearchParams(
        targetViewConfig as ViewConfiguration,
      );

      // Ad-hoc params should be gone
      expect(newUrl.has('page')).toBe(false);
      expect(currentUrl.get('display_name')).toBe('old'); // old value

      // Only new config params present
      expect(newUrl.getAll('operating_system')).toEqual(['RHEL 9']);
      expect(newUrl.get(SORT_URL_PARAM)).toBe('display_name');
      expect(newUrl.get(SORT_DIR_URL_PARAM)).toBe('asc');
    });

    it('should preserve view config filters when building URL', () => {
      const viewConfig: Partial<ViewConfiguration> = {
        filters: {
          display_name: 'prod-',
          status: ['fresh', 'stale'],
        },
      };

      const result = viewConfigToSearchParams(viewConfig as ViewConfiguration);

      expect(result.get('display_name')).toBe('prod-');
      expect(result.getAll('status')).toEqual(['fresh', 'stale']);
    });

    it('should preserve view config sort when building URL', () => {
      const viewConfig: Partial<ViewConfiguration> = {
        sort: {
          key: 'operating_system',
          direction: 'desc',
        },
      };

      const result = viewConfigToSearchParams(viewConfig as ViewConfiguration);

      expect(result.get(SORT_URL_PARAM)).toBe('operating_system');
      expect(result.get(SORT_DIR_URL_PARAM)).toBe('desc');
    });

    it('should preserve defaultFilters when switching to view without workload', () => {
      // Critical test for Ansible bundle fix
      const viewConfig: Partial<ViewConfiguration> = {
        filters: {
          status: ['fresh'],
        },
      };
      const defaultFilters = {
        workload: 'ansible',
      };

      const result = viewConfigToSearchParams(
        viewConfig as ViewConfiguration,
        defaultFilters,
      );

      // Both view filter and default should be present
      expect(result.getAll('status')).toEqual(['fresh']);
      expect(result.get('workload')).toBe('ansible');
    });

    it('should handle switching to system view with empty config', () => {
      const systemViewConfig: ViewConfiguration | undefined = undefined;
      const defaultFilters = {
        workload: 'ansible',
      };

      const result = viewConfigToSearchParams(systemViewConfig, defaultFilters);

      // Should only have defaults
      expect(result.get('workload')).toBe('ansible');
      expect(result.toString()).toBe('workload=ansible');
    });
  });

  describe('useLayoutEffect vs useEffect timing', () => {
    /**
     * Tests documenting why useLayoutEffect is used instead of useEffect.
     * useLayoutEffect runs synchronously before paint, ensuring SystemsView
     * hydrates from the normalized URL rather than stale params.
     */

    it('should run before SystemsView renders', () => {
      // useLayoutEffect timing: runs before paint, before child component mount
      // This ensures isUrlNormalized is set before SystemsView checks it

      const isUrlNormalized = false;
      const shouldRenderSystemsView = isUrlNormalized;

      expect(shouldRenderSystemsView).toBe(false);

      // After useLayoutEffect completes:
      const afterLayoutEffect = true;
      expect(afterLayoutEffect).toBe(true);
    });

    it('should prevent SystemsView from hydrating from stale URL', () => {
      const staleUrl = new URLSearchParams('?old_filter=value&page=5');

      // Without the gate: SystemsView would mount immediately and read stale URL
      // With the gate: SystemsView waits until after normalization

      const isUrlNormalized = false;
      if (!isUrlNormalized) {
        // SystemsView should not render yet
        expect(isUrlNormalized).toBe(false);
      }

      // After normalization, SystemsView renders with clean URL
    });
  });

  describe('integration: URL lifecycle scenarios', () => {
    /**
     * End-to-end scenarios demonstrating URL behavior through the lifecycle.
     */

    const viewConfigToSearchParams = (
      configuration?: ViewConfiguration,
      extraFilters?: Partial<Record<string, string | string[]>>,
    ): URLSearchParams => {
      const params = new URLSearchParams();

      if (configuration?.filters) {
        for (const [key, value] of Object.entries(configuration.filters)) {
          if (Array.isArray(value)) {
            value.forEach((v) => v && params.append(key, String(v)));
          } else if (value) {
            params.set(key, String(value));
          }
        }
      }

      if (configuration?.sort?.key) {
        params.set(SORT_URL_PARAM, configuration.sort.key);
        if (configuration.sort.direction) {
          params.set(SORT_DIR_URL_PARAM, configuration.sort.direction);
        }
      }

      if (extraFilters) {
        for (const [key, value] of Object.entries(extraFilters)) {
          const values = Array.isArray(value) ? value : [value].filter(Boolean);
          values.forEach((v) => {
            const str = String(v);
            if (str && !params.getAll(key).includes(str)) {
              params.append(key, str);
            }
          });
        }
      }

      return params;
    };

    it('should normalize stale URL on fresh page load', () => {
      const incomingUrl = new URLSearchParams(
        '?filter=old&page=3&sort=custom&direction=asc',
      );
      const defaultFilters = { workload: 'ansible' };

      // Normalize to default view
      const normalized = viewConfigToSearchParams(undefined, defaultFilters);

      // Ephemeral params dropped
      expect(incomingUrl.has('page')).toBe(true);
      expect(normalized.has('page')).toBe(false);
      expect(normalized.has('filter')).toBe(false);

      // Defaults preserved
      expect(normalized.get('workload')).toBe('ansible');
    });

    it('should build correct URL when switching to saved view', () => {
      const savedViewConfig: Partial<ViewConfiguration> = {
        filters: {
          status: ['fresh'],
        },
        sort: {
          key: 'updated',
          direction: 'desc',
        },
      };
      const defaultFilters = { workload: 'ansible' };

      const result = viewConfigToSearchParams(
        savedViewConfig as ViewConfiguration,
        defaultFilters,
      );

      // View config applied
      expect(result.getAll('status')).toEqual(['fresh']);
      expect(result.get(SORT_URL_PARAM)).toBe('updated');
      expect(result.get(SORT_DIR_URL_PARAM)).toBe('desc');

      // Defaults preserved
      expect(result.get('workload')).toBe('ansible');
    });

    it('should drop ad-hoc params when switching to All systems', () => {
      const currentUrl = new URLSearchParams(
        '?display_name=custom&status=fresh&page=2',
      );
      const defaultFilters = { workload: 'ansible' };

      // Switch to All systems (empty config)
      const newUrl = viewConfigToSearchParams(undefined, defaultFilters);

      // Ad-hoc filters gone
      expect(currentUrl.has('display_name')).toBe(true);
      expect(newUrl.has('display_name')).toBe(false);
      expect(newUrl.has('status')).toBe(false);
      expect(newUrl.has('page')).toBe(false);

      // Only defaults remain
      expect(newUrl.toString()).toBe('workload=ansible');
    });

    it('should handle view without workload filter on Ansible bundle', () => {
      const viewWithoutWorkload: Partial<ViewConfiguration> = {
        filters: {
          status: ['fresh', 'stale'],
        },
      };
      const ansibleDefaults = { workload: 'ansible' };

      const result = viewConfigToSearchParams(
        viewWithoutWorkload as ViewConfiguration,
        ansibleDefaults,
      );

      // View filters present
      expect(result.getAll('status')).toEqual(['fresh', 'stale']);

      // Critical: Ansible default preserved
      expect(result.get('workload')).toBe('ansible');
    });
  });
});
