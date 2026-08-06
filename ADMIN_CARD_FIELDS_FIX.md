# Admin Card Fields Fix - Show on Admin Card (Editable)

## Issue
The "Final Price" field (and other fields marked with "Show on Admin Card") were not appearing in the Quick Edit section on the Vehicle Allocation page.

## Root Cause
The fields were being filtered in two places:
1. **Main component** was filtering to only load fields with `belongsto === 'add-vehicles'`
2. **AllocCard/AllocRow components** were also filtering by `belongsto === 'add-vehicles'`

This prevented fields from other contexts (like "Vehicle Allocation" or "accounts") from appearing.

## Solution Applied

### 1. Updated Field Loading (Line ~632)
**Before:**
```javascript
setFields(Array.isArray(f) ? f.filter(fi => fi.belongsto === 'add-vehicles') : [])
```

**After:**
```javascript
setFields(Array.isArray(f) ? f : [])  // Load ALL fields regardless of belongsto
```

### 2. Updated AllocCard Component (Line ~215)
**Before:**
```javascript
const adminFields = fields.filter(f => f.showOnAdminCard && f.belongsto === 'add-vehicles').sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
```

**After:**
```javascript
// Get admin editable fields - include all contexts to support fields from any form
const adminFields = fields.filter(f => f.showOnAdminCard).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
```

### 3. Updated AllocRow Component (Line ~465)
Same change as AllocCard to ensure consistency in list view.

## Result

Now **ANY** field marked with `showOnAdminCard: true` will appear in the Quick Edit section, regardless of which form/context it belongs to:

- ✅ Fields from "add-vehicles" context
- ✅ Fields from "Vehicle Allocation" context  
- ✅ Fields from "accounts" context
- ✅ Fields from ANY custom context

## How to Use

### To Add a Field to Quick Edit:
1. Go to **Admin → Dynamic Fields** (`/admin/fields`)
2. Find your field (e.g., "Final Price") or create a new one
3. Check the **"Show on Admin Card (Editable)"** checkbox
4. Save the field

### The Field Will Now:
- Appear in the yellow "Quick Edit" section on vehicle allocation cards
- Be editable inline with auto-save on blur or Enter key
- Show in both Grid and List views
- Support any field type (text, number, date, etc.)

## Testing Checklist

- [x] Load Vehicle Allocation page
- [x] Verify fields with `showOnAdminCard: true` appear in Quick Edit section
- [x] Test fields from different contexts (add-vehicles, accounts, etc.)
- [x] Verify inline editing works
- [x] Confirm auto-save on blur
- [x] Confirm auto-save on Enter key
- [x] Test in both Grid and List views
- [x] Verify presold info also appears when applicable

## Example: Final Price Field

If you have a field named "Final Price" with:
- Type: number
- Belongs to: Vehicle Allocation (or any context)
- ☑ Show on Admin Card (Editable)

It will now appear in the Quick Edit section like this:

```
┌─────────────────────────────────┐
│ ✏️ QUICK EDIT                   │
├─────────────────────────────────┤
│ FINAL PRICE                     │
│ [        50000        ] 💾      │
│                                 │
│ (Other admin fields...)         │
└─────────────────────────────────┘
```

You can type the value and it auto-saves when you press Enter or click outside.

---

**Status**: ✅ Fixed and Ready
**Files Modified**: `app/admin/rikuso/page.jsx`
**Date**: 2026-08-06
