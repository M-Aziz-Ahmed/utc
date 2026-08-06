# Admin Editable Fields Feature Documentation

## Overview
The "Show on Admin Card (Editable)" feature allows dynamic fields to be displayed and edited directly on vehicle cards in the Vehicle Allocation page (`/admin/rikuso`). This provides quick editing capabilities for important fields without navigating to the vehicle edit page.

## Feature Implementation Status
✅ **COMPLETED** - All components implemented and tested

---

## Components Modified

### 1. Database Model (`models/DynamicFeilds.js`)
- Added `showOnAdminCard` boolean field to schema
- Default value: `false`

### 2. API Route (`app/api/newField/route.js`)
- Handles `showOnAdminCard` property during field creation
- Properly saves the field to database

### 3. Fields Management UI (`app/admin/fields/page.jsx`)
- Added checkbox option: "Show on Admin Card (Editable)"
- State management for `showOnAdminCard`
- Resets state after field creation

### 4. Field List Display (`components/fields/GetAllFields.jsx`)
- Shows "✏️ ADMIN" badge (emerald background) for fields with `showOnAdminCard: true`
- Edit mode supports toggling this option
- Checkbox in edit modal for updating existing fields

### 5. Vehicle Allocation Page (`app/admin/rikuso/page.jsx`)

#### Grid View (AllocCard Component):
- Displays "Quick Edit" section with yellow/amber background
- Shows all fields marked with `showOnAdminCard: true`
- Editable input fields with proper type detection (text, number, date)
- Auto-save functionality on blur or Enter key
- Disabled state while saving
- Proper error handling

#### List View (AllocRow Component):
- Replaces regular card fields with editable admin fields when available
- Yellow background (#fffbf0) for admin field cells
- Inline input fields with same auto-save functionality
- Proper field type support
- Graceful fallback to regular fields if no admin fields exist

---

## How to Use

### Creating an Admin Editable Field

1. Navigate to **Admin → Fields** (`/admin/fields`)
2. Create a new field or edit an existing one
3. Check the **"Show on Admin Card (Editable)"** checkbox
4. Save the field

The field will now:
- Show a **"✏️ ADMIN"** badge in the fields list
- Appear in the "Quick Edit" section on vehicle allocation cards
- Be editable directly from the allocation page

### Editing Fields on Vehicle Cards

#### Grid View:
1. Navigate to **Admin → Vehicle Allocation** (`/admin/rikuso`)
2. Ensure you're in Grid view mode (grid icon in top right)
3. Look for the yellow "Quick Edit" section on each vehicle card
4. Edit any field value
5. Changes auto-save on:
   - Pressing Enter
   - Clicking outside the field (blur event)

#### List View:
1. Switch to List view mode (list icon in top right)
2. Admin editable fields replace regular display fields
3. Fields have yellow background for easy identification
4. Edit inline with same auto-save behavior

---

## Technical Details

### Auto-Save Logic
```javascript
onBlur={e => {
    if (e.target.value !== (vehicle[field._id] ?? vehicle[field.label] ?? '')) {
        handleFieldSave(field._id, e.target.value)
    }
}}

onKeyDown={e => {
    if (e.key === 'Enter') {
        e.target.blur()
    }
}}
```

### Field Save Handler
```javascript
const handleFieldSave = async (fieldId, value) => {
    setSaving(true)
    try {
        const field = fields.find(f => f._id === fieldId)
        const payload = { vehicleId: vehicle._id, [fieldId]: value }
        if (field?.label) payload[field.label] = value
        
        const res = await fetch('/api/vehicles', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        if (!res.ok) throw new Error('Failed to save')
    } catch (e) {
        alert('Failed to save field: ' + e.message)
    } finally {
        setSaving(false)
    }
}
```

### Field Type Support
- **Text fields**: Standard text input
- **Number fields**: Number input with numeric keyboard
- **Date fields**: Date picker input
- **Other types**: Default to text input

---

## Visual Indicators

### Field List Badges
- **💰 PRICE** (Blue) - Field displayed as vehicle price on public site
- **📌 CARD** (Indigo) - Field shown on public vehicle cards
- **✏️ ADMIN** (Emerald) - Field editable on admin allocation cards
- **Formula** (Yellow/Amber) - Formula field with calculation
- **ƒ X fields** - Shows number of fields in formula

### Allocation Page
- **Yellow Background (#fffbf0)** - Quick Edit section in grid view
- **Yellow Border (#fcd34d)** - Input fields for admin editable fields
- **Amber Labels (#92400e)** - Field labels in Quick Edit section

---

## Best Practices

### When to Use Admin Editable Fields
✅ **Good Use Cases:**
- Frequently updated fields (pricing, status, notes)
- Fields that need quick updates during allocation
- Fields that change per vehicle in batch operations
- Reference numbers or tracking IDs

❌ **Avoid for:**
- Complex fields requiring validation
- Fields that are rarely updated
- Calculated/formula fields (read-only)
- Fields with complex dependencies

### Field Selection Tips
1. **Limit to 3-5 fields** - Too many fields clutter the interface
2. **Prioritize frequently edited fields** - Save time on common operations
3. **Consider field type** - Simple types (text, number, date) work best
4. **Group related fields** - Keep logically related fields together

---

## Integration with Other Features

### Works With:
- ✅ **Formula Fields** - Can display calculated values (read-only recommended)
- ✅ **Sum Fields** - Can display summed values (read-only recommended)
- ✅ **Display as Price** - Editable field can also be the price field
- ✅ **Show on Public Card** - Same field can appear on both admin and public cards
- ✅ **Cross-context fields** - Works with both 'add-vehicles' and 'accounts' contexts

### Filter Logic:
- Only fields with `belongsto: 'add-vehicles'` are shown
- Fields are sorted by their `order` property
- Fields respect the `showOnAdminCard: true` flag

---

## Example Use Case

### Scenario: Quick Price Updates During Allocation

**Setup:**
1. Create a field: "Final FOB Price"
   - Type: number
   - Belongs to: add-vehicles
   - ✓ Display as Price
   - ✓ Show on Admin Card (Editable)

2. Create a field: "Allocation Notes"
   - Type: text
   - Belongs to: add-vehicles
   - ✓ Show on Admin Card (Editable)

**Result:**
- Both fields appear in yellow "Quick Edit" section
- Update prices directly while allocating vehicles
- Add notes without leaving the page
- Changes save automatically
- Public site displays updated price immediately

---

## Troubleshooting

### Field Not Appearing on Allocation Page
1. ✓ Verify `showOnAdminCard: true` in database
2. ✓ Check field has `belongsto: 'add-vehicles'`
3. ✓ Refresh the allocation page
4. ✓ Check browser console for errors

### Auto-Save Not Working
1. ✓ Check network tab for API calls
2. ✓ Verify vehicle ID is valid
3. ✓ Check field ID matches database
4. ✓ Ensure proper permissions

### Field Value Not Updating
1. ✓ Check if field uses label or ID for storage
2. ✓ Verify vehicle model accepts the field
3. ✓ Check data type compatibility
4. ✓ Refresh page after save

---

## Database Schema

```javascript
{
  label: String,
  type: String,
  isRequired: Boolean,
  belongsto: String,
  options: [String],
  order: Number,
  showOnCard: Boolean,
  linkedTax: ObjectId,
  linkedField: String,
  linkedFields: [String],
  vehicleField: String,
  formulaFields: [{
    field: String,
    operation: String
  }],
  displayAsPrice: Boolean,      // Show as price on public site
  showOnPublicCard: Boolean,     // Show on public vehicle cards
  showOnAdminCard: Boolean       // Show as editable on admin cards ✨
}
```

---

## Future Enhancements (Optional)

- [ ] Bulk edit mode for multiple vehicles
- [ ] Field-level permissions (who can edit)
- [ ] Save confirmation toast notification
- [ ] Undo/redo functionality
- [ ] Field validation rules
- [ ] Conditional field visibility
- [ ] Field change history/audit log

---

## Files Modified

1. `models/DynamicFeilds.js` - Added schema field
2. `app/api/newField/route.js` - API support
3. `app/admin/fields/page.jsx` - UI for creating/editing
4. `components/fields/GetAllFields.jsx` - Badge display
5. `app/admin/rikuso/page.jsx` - Editable fields in allocation page

---

## Testing Checklist

- [x] Create new field with showOnAdminCard enabled
- [x] Field appears in Quick Edit section (grid view)
- [x] Field appears in list view (yellow background)
- [x] Edit field value and press Enter - saves correctly
- [x] Edit field value and click outside - saves correctly
- [x] Multiple admin fields display properly
- [x] Field type detection works (text, number, date)
- [x] Saving state disables inputs
- [x] Error handling shows alert
- [x] Badge appears in fields list
- [x] Edit existing field to add/remove showOnAdminCard

---

**Status**: ✅ Feature Complete and Production Ready
**Last Updated**: 2026-08-06
**Version**: 1.0.0
