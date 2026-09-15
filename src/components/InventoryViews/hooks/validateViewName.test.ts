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
  describe('empty names', () => {
    it('should invalidate an empty name', () => {
      const views = [makeView('1', 'My View')];
      const result = validateViewName(views, '');

      expect(result.isValid).toBe(false);
      expect(result.validated).toBe('default');
      expect(result.error).toBeNull();
    });

    it('should invalidate a whitespace-only name', () => {
      const views = [makeView('1', 'My View')];
      const result = validateViewName(views, '   ');

      expect(result.isValid).toBe(false);
      expect(result.validated).toBe('default');
      expect(result.error).toBeNull();
    });
  });

  describe('length validation', () => {
    it('should accept names at max length (255 characters)', () => {
      const maxLengthName = 'a'.repeat(255);
      const result = validateViewName([], maxLengthName);

      expect(result.isValid).toBe(true);
      expect(result.validated).toBe('success');
      expect(result.error).toBeNull();
    });

    it('should reject names longer than 255 characters', () => {
      const tooLongName = 'a'.repeat(256);
      const result = validateViewName([], tooLongName);

      expect(result.isValid).toBe(false);
      expect(result.validated).toBe('error');
      expect(result.error).toBe('TOO_LONG');
    });

    it('should reject names much longer than max length', () => {
      const wayTooLongName = 'a'.repeat(500);
      const result = validateViewName([], wayTooLongName);

      expect(result.isValid).toBe(false);
      expect(result.validated).toBe('error');
      expect(result.error).toBe('TOO_LONG');
    });
  });

  describe('character validation', () => {
    it('should accept names with letters, numbers, and allowed characters', () => {
      const result = validateViewName([], "Bob's RHEL 9.4 view_test-123");

      expect(result.isValid).toBe(true);
      expect(result.validated).toBe('success');
      expect(result.error).toBeNull();
    });

    it('should accept names with periods', () => {
      const result = validateViewName([], 'RHEL 9.4');

      expect(result.isValid).toBe(true);
      expect(result.validated).toBe('success');
      expect(result.error).toBeNull();
    });

    it('should accept names with apostrophes', () => {
      const result = validateViewName([], "Bob's View");

      expect(result.isValid).toBe(true);
      expect(result.validated).toBe('success');
      expect(result.error).toBeNull();
    });

    it('should accept names with hyphens and underscores', () => {
      const result = validateViewName([], 'my-view_2024');

      expect(result.isValid).toBe(true);
      expect(result.validated).toBe('success');
      expect(result.error).toBeNull();
    });

    it('should reject names with invalid special characters (@)', () => {
      const result = validateViewName([], 'my@view');

      expect(result.isValid).toBe(false);
      expect(result.validated).toBe('error');
      expect(result.error).toBe('INVALID_CHARACTERS');
    });

    it('should reject names with invalid special characters (!)', () => {
      const result = validateViewName([], 'my!view');

      expect(result.isValid).toBe(false);
      expect(result.validated).toBe('error');
      expect(result.error).toBe('INVALID_CHARACTERS');
    });

    it('should reject names with invalid special characters (#)', () => {
      const result = validateViewName([], 'view#123');

      expect(result.isValid).toBe(false);
      expect(result.validated).toBe('error');
      expect(result.error).toBe('INVALID_CHARACTERS');
    });

    it('should reject names with invalid special characters ($)', () => {
      const result = validateViewName([], 'view$name');

      expect(result.isValid).toBe(false);
      expect(result.validated).toBe('error');
      expect(result.error).toBe('INVALID_CHARACTERS');
    });
  });

  describe('alphanumeric requirement', () => {
    it('should reject names with only punctuation (periods)', () => {
      const result = validateViewName([], '...');

      expect(result.isValid).toBe(false);
      expect(result.validated).toBe('error');
      expect(result.error).toBe('NO_ALPHANUMERIC');
    });

    it('should reject names with only punctuation (hyphens)', () => {
      const result = validateViewName([], '---');

      expect(result.isValid).toBe(false);
      expect(result.validated).toBe('error');
      expect(result.error).toBe('NO_ALPHANUMERIC');
    });

    it('should reject names with only punctuation (apostrophes)', () => {
      const result = validateViewName([], "'''");

      expect(result.isValid).toBe(false);
      expect(result.validated).toBe('error');
      expect(result.error).toBe('NO_ALPHANUMERIC');
    });

    it('should reject names with only spaces and punctuation', () => {
      const result = validateViewName([], '  - . -  ');

      expect(result.isValid).toBe(false);
      expect(result.validated).toBe('error');
      expect(result.error).toBe('NO_ALPHANUMERIC');
    });

    it('should accept names with at least one letter', () => {
      const result = validateViewName([], 'a...');

      expect(result.isValid).toBe(true);
      expect(result.validated).toBe('success');
      expect(result.error).toBeNull();
    });

    it('should accept names with at least one number', () => {
      const result = validateViewName([], '...1');

      expect(result.isValid).toBe(true);
      expect(result.validated).toBe('success');
      expect(result.error).toBeNull();
    });
  });

  describe('duplicate detection', () => {
    it('should validate a unique name', () => {
      const views = [makeView('1', 'Existing View')];
      const result = validateViewName(views, 'New View');

      expect(result.isValid).toBe(true);
      expect(result.validated).toBe('success');
      expect(result.error).toBeNull();
    });

    it('should flag an exact duplicate name', () => {
      const views = [makeView('1', 'My View')];
      const result = validateViewName(views, 'My View');

      expect(result.isValid).toBe(false);
      expect(result.validated).toBe('error');
      expect(result.error).toBe('DUPLICATE');
    });

    it('should be case-insensitive for duplicates', () => {
      const views = [makeView('1', 'My View')];
      const result = validateViewName(views, 'my view');

      expect(result.isValid).toBe(false);
      expect(result.validated).toBe('error');
      expect(result.error).toBe('DUPLICATE');
    });

    it('should trim whitespace before comparing duplicates', () => {
      const views = [makeView('1', 'My View')];
      const result = validateViewName(views, '  My View  ');

      expect(result.isValid).toBe(false);
      expect(result.validated).toBe('error');
      expect(result.error).toBe('DUPLICATE');
    });

    it('should exclude a view by ID (for Rename modal)', () => {
      const views = [makeView('view-1', 'My View')];
      const result = validateViewName(views, 'My View', {
        excludeViewId: 'view-1',
      });

      expect(result.isValid).toBe(true);
      expect(result.validated).toBe('success');
      expect(result.error).toBeNull();
    });

    it('should still flag duplicates when excludeViewId does not match', () => {
      const views = [
        makeView('view-1', 'My View'),
        makeView('view-2', 'Other View'),
      ];
      const result = validateViewName(views, 'My View', {
        excludeViewId: 'view-2',
      });

      expect(result.isValid).toBe(false);
      expect(result.validated).toBe('error');
      expect(result.error).toBe('DUPLICATE');
    });

    it('should handle an empty views list', () => {
      const result = validateViewName([], 'Any Name');

      expect(result.isValid).toBe(true);
      expect(result.validated).toBe('success');
      expect(result.error).toBeNull();
    });
  });

  describe('validation order', () => {
    it('should check invalid characters before duplicates', () => {
      const views = [makeView('1', 'valid@name')];
      const result = validateViewName(views, 'valid@name');

      // Should fail on invalid characters, not duplicates
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('INVALID_CHARACTERS');
    });

    it('should check alphanumeric requirement before duplicates', () => {
      const views = [makeView('1', '---')];
      const result = validateViewName(views, '---');

      // Should fail on alphanumeric requirement, not duplicates
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('NO_ALPHANUMERIC');
    });
  });
});
