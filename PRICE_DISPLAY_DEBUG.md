# Price Display Debugging Guide

## Issue
The "Final Price" field values entered in the admin allocation cards are not appearing on the public website.

## Steps to Debug

### 1. Verify Field Configuration
Go to **Admin → Dynamic Fields** and check your "Final Price" field:
- ☑ **Display as Price** - MUST be checked
- ☑ **Show on Admin Card (Editable)** - Should be checked  
- Type should be: **number**
- Label should be: **Final Price** (or "FINAL PRICE")

### 2. Check Field Storage
The field value needs to be saved correctly. After the latest update, when you save a value, it will be stored under:
- The field's MongoDB `_id` (e.g., `67abc123...`)
- The field's label (e.g., `Final Price`)
- The field's sanitized label (e.g., `FinalPrice` - dots removed)

### 3. Test the Save Process
1. Go to **Admin → Vehicle Allocation** (`/admin/rikuso`)
2. Find a vehicle card
3. In the yellow "Quick Edit" section, enter a price (e.g., 50000)
4. Press Enter or click outside the field
5. The value should save

### 4. Verify on Public Site
1. Go to the home page or stock page
2. The vehicle should now show the price instead of "Price on Request"

## Common Issues and Solutions

### Issue 1: Field Not Showing in Quick Edit
**Problem**: Field doesn't appear in the yellow Quick Edit section on allocation cards.
**Solution**: 
- Verify "Show on Admin Card (Editable)" is checked in Dynamic Fields
- The field can belong to ANY form/context now (not just add-vehicles)
- Refresh the allocation page

### Issue 2: Price Not Showing on Public Site  
**Problem**: Value is saved but "Price on Request" still shows.
**Solution**:
- Verify "Display as Price" is checked
- Only ONE field should have "Display as Price" checked
- Clear browser cache and refresh
- Check that the value was actually saved (go back to allocation page and verify it's still there)

### Issue 3: Value Doesn't Save
**Problem**: After entering a value and pressing Enter, it doesn't persist.
**Solution**:
- Check browser console for errors
- Verify the vehicle ID is valid
- Check network tab to see if PATCH request succeeds

## Technical Details

### How Price Display Works:
1. VehicleCard component fetches all fields from `/api/fields`
2. Finds the field with `displayAsPrice: true`
3. Checks vehicle data for the value using:
   - `vehicle[field._id]`
   - `vehicle[field.label]`
   - `vehicle[sanitizedLabel]` (label with dots removed)
4. If found, displays the value
5. If not found, shows "Price on Request"

### Field Value Lookup Order:
```javascript
// Example: field label is "Final Price"
const value = 
  vehicle["67abc123..."] ||    // MongoDB field ID
  vehicle["Final Price"] ||     // Original label
  vehicle["FinalPrice"]         // Sanitized label (dots removed)
```

### Save Payload Structure:
```javascript
{
  vehicleId: "vehicle123",
  "67abc123...": "50000",      // Field ID
  "Final Price": "50000",       // Original label  
  "FinalPrice": "50000"         // Sanitized label
}
```

## Manual Test Steps

### Step 1: Check Field in Database
After saving, you should be able to see the field value if you:
1. Go to vehicle edit page (`/admin/vehicles/edit/[id]`)
2. Check if the "Final Price" field shows the value you entered

### Step 2: Check Raw Vehicle Data
If you have database access, check the vehicle document:
```json
{
  "_id": "...",
  "manufacturer": "Toyota",
  "model": "Porte",
  "FinalPrice": 50000,        // Should see this
  "Final Price": 50000,       // Or this
  "67abc123...": 50000        // Or this
}
```

### Step 3: Network Inspection
1. Open browser DevTools (F12)
2. Go to Network tab
3. Go to allocation page
4. Enter a price in Quick Edit
5. Press Enter
6. Look for PATCH request to `/api/vehicles`
7. Check the request payload contains the value
8. Check the response is 200 OK

## Quick Fix Checklist

- [ ] "Display as Price" is checked on the field
- [ ] Only ONE field has "Display as Price" checked
- [ ] Field value is being entered in Quick Edit section
- [ ] Value persists after pressing Enter
- [ ] Browser cache is cleared
- [ ] Page is refreshed after saving
- [ ] No console errors appear
- [ ] Network request shows 200 OK status

## If Still Not Working

Try this test:
1. Go to **Admin → Vehicles → Edit** a specific vehicle
2. Find the "Final Price" field in the edit form
3. Enter a value directly there and save
4. Check if it appears on the public site

If it works from the edit page but not from the allocation page, there's an issue with the allocation page save logic.

If it doesn't work from either location, the issue is with:
- Field configuration (Display as Price not checked)
- VehicleCard component not finding the value
- Multiple fields marked as "Display as Price" (only one should be)

---

**Next Steps**: After deploying these changes, try entering a price in the allocation Quick Edit section and see if it appears on the public site. If it still doesn't work, let me know and we'll add more debugging.
