import type { ViewOut } from '../../../api/inventoryViewsApi';
import { validateViewName } from './useViewNameValidation';

const makeView = (id: string, name: string): ViewOut => ({
  id,
  name,
  org_id: 'org-1',
  description: '',
  is_system_view: false,
  configuration: { columns: [] },
  org_wide: false,
  created_by: 'user-1',
  created_at: '',
  updated_at: '',
  is_owner: true,
});

describe('validateViewName', () => {
  it('should not flag an empty name as duplicate', () => {
    const views = [makeView('1', 'My View')];
    const result = validateViewName(views, '');

    expect(result.isDuplicate).toBe(false);
    expect(result.validated).toBe('default');
  });

  it('should not flag a whitespace-only name as duplicate', () => {
    const views = [makeView('1', 'My View')];
    const result = validateViewName(views, '   ');

    expect(result.isDuplicate).toBe(false);
    expect(result.validated).toBe('default');
  });

  it('should not flag a unique name as duplicate', () => {
    const views = [makeView('1', 'Existing View')];
    const result = validateViewName(views, 'New View');

    expect(result.isDuplicate).toBe(false);
    expect(result.validated).toBe('default');
  });

  it('should flag an exact duplicate name', () => {
    const views = [makeView('1', 'My View')];
    const result = validateViewName(views, 'My View');

    expect(result.isDuplicate).toBe(true);
    expect(result.validated).toBe('error');
  });

  it('should be case-insensitive', () => {
    const views = [makeView('1', 'My View')];
    const result = validateViewName(views, 'my view');

    expect(result.isDuplicate).toBe(true);
    expect(result.validated).toBe('error');
  });

  it('should trim whitespace before comparing', () => {
    const views = [makeView('1', 'My View')];
    const result = validateViewName(views, '  My View  ');

    expect(result.isDuplicate).toBe(true);
    expect(result.validated).toBe('error');
  });

  it('should exclude a view by ID (for Rename modal)', () => {
    const views = [makeView('view-1', 'My View')];
    const result = validateViewName(views, 'My View', {
      excludeViewId: 'view-1',
    });

    expect(result.isDuplicate).toBe(false);
    expect(result.validated).toBe('default');
  });

  it('should still flag duplicates when excludeViewId does not match', () => {
    const views = [
      makeView('view-1', 'My View'),
      makeView('view-2', 'Other View'),
    ];
    const result = validateViewName(views, 'My View', {
      excludeViewId: 'view-2',
    });

    expect(result.isDuplicate).toBe(true);
    expect(result.validated).toBe('error');
  });

  it('should handle an empty views list', () => {
    const result = validateViewName([], 'Any Name');

    expect(result.isDuplicate).toBe(false);
    expect(result.validated).toBe('default');
  });
});
