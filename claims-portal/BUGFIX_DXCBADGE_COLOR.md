# Bug Fix: DxcBadge Color Prop Dashboard Crash

**Date:** January 21, 2026
**Status:** ✅ RESOLVED
**Severity:** Critical (Dashboard completely non-functional)

---

## Problem Summary

The dashboard would briefly load then crash with a blank white screen whenever demo data with routing information was present. The browser console showed:

```
TypeError: Cannot read properties of undefined (reading 'background')
```

This error occurred multiple times in the Emotion CSS-in-JS compiled code.

---

## Root Cause

**Component:** `src/components/shared/FastTrackBadge.jsx`
**Issue:** The `DxcBadge` component's `color` prop was being passed hex color values

```javascript
// BROKEN CODE (Lines 23-27, 51-55)
<DxcBadge
  label="FastTrack"
  color="#0095FF"  // ❌ NOT SUPPORTED in Halstack v16
  size={size}
/>

<DxcBadge
  label="Standard"
  color="#666666"  // ❌ NOT SUPPORTED in Halstack v16
  size={size}
/>
```

**Why it broke:**
In Halstack v16, the `DxcBadge` component does not accept custom hex color values for the `color` prop. The component internally tries to look up the color in a predefined color palette object, and when it doesn't find the hex value key, it attempts to access `undefined.background`, causing the crash.

---

## Diagnostic Process

### Step 1: Eliminated unrelated issues
- Initially suspected unsupported DxcContainer props
- Removed all `height`, `width`, `borderRadius`, `boxShadow`, `grow` props
- Problem persisted

### Step 2: Isolated the trigger
- Disabled all demo data → Dashboard worked ✅
- Created `demoDataSimple.js` with minimal fields → Dashboard worked ✅
- Added basic routing data → **Dashboard crashed** ❌

### Step 3: Narrowed down to FastTrackBadge
- Examined Dashboard.jsx line 829: renders `<FastTrackBadge>` when `hasFastTrack` is true
- Identified FastTrackBadge.jsx uses `DxcBadge` with `color` prop
- Removed `color` props → **Dashboard worked** ✅

### Step 4: Verified fix with full data
- Added workflow/SLA data → Dashboard worked ✅
- Restored full demoData.js (25 claims, requirements, timeline) → **Dashboard worked** ✅

---

## Solution

**File:** `src/components/shared/FastTrackBadge.jsx`
**Changes:** Removed `color` prop from both DxcBadge instances

```javascript
// FIXED CODE
<DxcBadge
  label="FastTrack"
  // color prop removed - uses default badge styling
  size={size}
/>

<DxcBadge
  label="Standard"
  // color prop removed - uses default badge styling
  size={size}
/>
```

**Result:** Badges now use Halstack's default styling, which works correctly with Emotion CSS-in-JS

---

## Lessons Learned

### 1. **Halstack v16 DxcBadge API Changes**
   - `color` prop does NOT accept custom hex values
   - Must use predefined color names or omit prop entirely
   - Documentation may not clearly state this breaking change from v15

### 2. **Incremental Testing is Critical**
   - Building up from minimal data helped isolate the exact field causing the crash
   - Without incremental testing, would have wasted time on wrong fixes

### 3. **Emotion CSS-in-JS Error Messages are Cryptic**
   - "Cannot read properties of undefined (reading 'background')" doesn't directly point to DxcBadge
   - Need to trace component rendering to find the actual culprit

### 4. **Demo Data Can Hide Production Issues**
   - The crash only happened when routing data was present
   - Need to test with and without optional fields

---

## Testing Checklist

- [x] Dashboard loads without demo data
- [x] Dashboard loads with minimal demo data
- [x] Dashboard loads with routing data
- [x] Dashboard loads with workflow data
- [x] Dashboard loads with full demo data (25 claims)
- [x] FastTrack badges display correctly
- [x] Standard badges display correctly
- [x] No console errors
- [x] Theme changes work correctly
- [x] All navigation works

---

## Files Modified

| File | Change |
|------|--------|
| `src/components/shared/FastTrackBadge.jsx` | Removed `color="#0095FF"` and `color="#666666"` props from DxcBadge |
| `src/data/demoDataSimple.js` | Created for incremental testing (kept for future debugging) |
| `src/services/api/cmaService.js` | Toggled between demoData/demoDataSimple during testing |

---

## Related Components to Audit

⚠️ **Search entire codebase for other DxcBadge instances that might have `color` prop:**

```bash
grep -r "DxcBadge" claims-portal/src/ | grep "color"
```

**Known safe components:**
- All other badge usages in the codebase currently don't use custom colors

---

## Preventive Measures

### 1. **Add ESLint rule (if possible)**
   - Warn on DxcBadge with color prop containing hex values
   - Pattern: `color="#[0-9A-Fa-f]{6}"`

### 2. **Document Halstack v16 quirks**
   - Create `HALSTACK_V16_NOTES.md` with known API changes
   - Include this DxcBadge limitation

### 3. **Comprehensive testing protocol**
   - Always test with demo data ON and OFF
   - Test with minimal data structures before full data
   - Check browser console for ANY errors, even if UI appears to work

---

## Performance Impact

**Before Fix:** Dashboard unusable (blank screen)
**After Fix:** Dashboard loads in ~2s with 25 claims
**No regression:** All other features working as expected

---

## Conclusion

This was a **critical production-blocking bug** caused by a subtle API incompatibility in Halstack v16's DxcBadge component. The fix was simple (remove 2 props), but identifying the root cause required systematic elimination of possibilities through incremental testing.

**Key Takeaway:** When migrating between major versions of UI libraries, always audit components for API changes, especially props that accept custom values.

---

## References

- Halstack React v16.0.0 Documentation: https://developer.dxc.com/halstack/
- Emotion CSS-in-JS: https://emotion.sh/
- Related Commits:
  - `bddcdb5`: Fix DxcBadge color prop causing crash
  - `d1b7f51`: Restore full demo data - dashboard working with all features
