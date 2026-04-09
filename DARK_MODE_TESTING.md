# Dark Mode Testing Guide

## Quick Start

### Enable Dark Mode (Browser Console)
```javascript
document.getElementsByTagName('html')[0].classList.add('pf-v6-theme-dark', 'pf-v5-theme-dark');
```

### Disable Dark Mode (if needed)
```javascript
document.getElementsByTagName('html')[0].classList.remove('pf-v6-theme-dark', 'pf-v5-theme-dark');
```

---

## Testing Checklist

### Pages to Test
- [ ] Systems table (main view)
- [ ] System Details page
- [ ] Workspaces view
- [ ] Groups view
- [ ] Images view (if applicable)
- [ ] Any modals/dialogs
- [ ] Filters and dropdowns
- [ ] Empty states

### What to Look For
- [ ] **Text readability** - All text has good contrast
- [ ] **Backgrounds** - Cards, panels, modals look good
- [ ] **Borders** - Visible and appropriately styled
- [ ] **Icons** - Visible and correct color
- [ ] **Tables** - Rows, headers, hover states work
- [ ] **Buttons** - All states (default, hover, disabled) look good
- [ ] **Form inputs** - Text inputs, dropdowns, checkboxes
- [ ] **Charts/graphs** - If any exist, check visibility

---

## Screenshot Template

For each page, capture:
1. **Before** (light mode)
2. **After** (dark mode enabled)
3. Note any issues found

---

## Known Good News ✅

- Already on PatternFly 6 (v6.4.x)
- Minimal hardcoded colors in codebase
- Most components use PF6 tokens already
- Should require minimal fixes

---

## Reference Links

- [PF6 Dark Theme Handbook](https://www.patternfly.org/developer-resources/dark-theme-handbook/#enabling-dark-theme)
- [JIRA: RHCLOUD-44750](https://redhat.atlassian.net/browse/RHCLOUD-44750)
- [Epic: RHCLOUD-39367](https://redhat.atlassian.net/browse/RHCLOUD-39367)

---

## Next Steps After Testing

1. Document all issues found
2. Prioritize by severity (blockers vs nice-to-have)
3. Fix issues using PF6 tokens
4. Create PR with screenshots
5. Get team review
