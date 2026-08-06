# Dynamic Fields - New Features Documentation

## Overview
This document describes the new features added to the Dynamic Fields system, including formula fields, price display options, and public card visibility controls.

---

## 1. Formula Field Type

### Description
Formula fields allow you to create custom calculations using multiple fields with various mathematical operations (add, subtract, multiply, divide).

### Features
- **Multiple Operations**: Support for +, −, ×, ÷ operations
- **Field Chaining**: Build complex formulas by combining multiple fields
- **Auto-calculation**: Values are calculated automatically in real-time
- **Cross-context**: Can reference fields from both 'add-vehicles' and 'accounts' contexts

### How to Create a Formula Field

1. Go to **Admin → Dynamic Fields**
2. Select **"formula"** as the field type
3. Click **"Add Field to Formula"** to add fields
4. For each field (except the first):
   - Select the operation (+, −, ×, ÷)
   - Choose the source field
5. Preview your formula at the bottom
6. Set other options (label, required, belongs to)
7. Click **"Create Field"**

### Example Use Cases
- **Total Cost**: `Push Price + Auction Fee + Shipping + Customs`
- **Profit Margin**: `Selling Price − Total Cost`
- **Price Per KM**: `Price ÷ Mileage`
- **Discount Price**: `Original Price − (Original Price × Discount Rate ÷ 100)`

### Visual Indicators
- Formula fields display with a **yellow/amber background** with "Formula" badge
- In the field list, shows **"ƒ X fields"** badge indicating number of fields in formula
- Hover over the field to see the breakdown of the calculation

---

## 2. Display as Price Option

### Description
Allows you to designate any dynamic field to display as the vehicle's price on the main website instead of "Price on Request".

### Features
- Replace the default price field with any custom field
- Perfect for displaying calculated prices (like FOB price, CIF price, final price)
- Only one field can be set as the price display at a time
- Works on home page vehicle cards and stock listing pages

### How to Enable

**When Creating a Field:**
1. Go to **Admin → Dynamic Fields**
2. Create your field (any type: number, formula, etc.)
3. Check **"Display as Price"** in the Display Options section
4. Complete and save the field

**For Existing Fields:**
1. Go to **Admin → Dynamic Fields** → **Existing Fields**
2. Click the **edit icon** on your field
3. Scroll to **Display Options**
4. Check **"Display as Price"**
5. Click **Save**

### Visual Indicators
- Fields with this option show a **"💰 PRICE"** badge in the field list
- Blue background with prominent display

### Example Use Cases
- Display **"FOB Price"** calculated field as the vehicle price
- Show **"Final Price"** (including all fees and taxes)
- Display **"CIF Price"** for international customers
- Show **"Sale Price"** (original price minus discount)

---

## 3. Show on Vehicle Cards Option

### Description
Display specific dynamic fields on vehicle cards on the home page and stock listing pages, appearing below the price.

### Features
- Multiple fields can be shown on cards simultaneously
- Fields appear in a clean, organized layout below the price
- Perfect for highlighting key selling points or important details
- Automatically formatted with label and value

### How to Enable

**When Creating a Field:**
1. Go to **Admin → Dynamic Fields**
2. Create your field
3. Check **"Show on Vehicle Cards"** in the Display Options section
4. Complete and save the field

**For Existing Fields:**
1. Go to **Admin → Dynamic Fields** → **Existing Fields**
2. Click the **edit icon** on your field
3. Scroll to **Display Options**
4. Check **"Show on Vehicle Cards"**
5. Click **Save**

### Visual Indicators
- Fields with this option show a **"📌 CARD"** badge in the field list
- Indigo background with distinctive marker

### Example Use Cases
- Display **"Warranty Status"** on all vehicle cards
- Show **"Inspection Grade"** for quality assurance
- Highlight **"Delivery Time"** for customer convenience
- Display **"Discount Percentage"** for sales promotions

---

## 4. Field Calculation Logic Improvements

### Fixed Issues
- **Cross-context calculations**: Sum and formula fields can now properly reference fields from different contexts (add-vehicles and accounts)
- **Recursive calculations**: Tax fields, sum fields, and formula fields can now reference each other correctly
- **Proper context resolution**: Each field uses its own belongsto context during calculation

### How It Works
When calculating sum or formula fields:
1. System finds each linked field by label
2. Determines the field's context (belongsto)
3. Retrieves the value from the correct data source
4. Performs the calculation
5. Displays the result with hover tooltip showing breakdown

---

## Complete Workflow Example

### Scenario: Creating a "Final Price" that displays on vehicle cards

1. **Create base price field**
   - Label: "Push Price"
   - Type: number
   - Belongs to: accounts

2. **Create fee fields**
   - Create "Auction Fee" (number, accounts)
   - Create "Shipping Cost" (number, accounts)
   - Create "Insurance" (number, accounts)

3. **Create tax field**
   - Label: "Sales Tax"
   - Type: tax
   - Link to tax: 8% Sales Tax
   - Calculate from: Push Price

4. **Create formula for final price**
   - Label: "Final Price"
   - Type: formula
   - Formula: `Push Price + Auction Fee + Shipping Cost + Insurance + Sales Tax`
   - ✅ Check "Display as Price"
   - ✅ Check "Show on Vehicle Cards"

5. **Result**
   - Vehicle cards now show "Final Price" instead of "Price on Request"
   - The final price appears prominently on all vehicle listings
   - Calculation happens automatically when any component value changes

---

## Technical Notes

### Database Schema Changes
Added to `DynamicFeilds` model:
```javascript
{
  formulaFields: [{ 
    field: String,
    operation: String (enum: ['add', 'subtract', 'multiply', 'divide'])
  }],
  displayAsPrice: Boolean (default: false),
  showOnPublicCard: Boolean (default: false)
}
```

### API Endpoints Updated
- `POST /api/newField` - Now accepts formulaFields, displayAsPrice, showOnPublicCard
- `PATCH /api/fields/[id]` - Now updates formulaFields, displayAsPrice, showOnPublicCard

### Components Updated
1. **FieldInput** (accounts and edit pages) - Added formula calculation logic
2. **VehicleCard** - Added logic to fetch and display custom fields and price
3. **GetAllFields** - Added edit UI for formula fields and display options
4. **Fields page** - Added creation UI for formula fields and display options

---

## Best Practices

1. **Formula Fields**
   - Keep formulas simple and logical
   - Test calculations with sample data before deploying
   - Use descriptive field names for clarity
   - Consider the order of operations (multiply/divide before add/subtract)

2. **Display as Price**
   - Only use for final customer-facing prices
   - Ensure the field always has a value (use formula fields with fallbacks)
   - Test on both desktop and mobile views

3. **Show on Public Card**
   - Limit to 2-3 fields maximum for clean appearance
   - Choose fields that provide real value to customers
   - Keep field labels short and clear
   - Test with various field value lengths

4. **Performance**
   - Formula fields calculate on render, not stored in database
   - Consider impact when using many formula fields on large vehicle lists
   - Cache field configurations when possible

---

## Troubleshooting

### Formula not calculating correctly
- Check that all linked fields have values
- Verify field names match exactly (case-sensitive)
- Ensure source fields are numeric or text-numeric
- Check for division by zero scenarios

### Price not displaying
- Verify field has `displayAsPrice: true`
- Check that the field has a value in the vehicle data
- Ensure field ID exists in vehicle document
- Clear browser cache and reload

### Fields not showing on cards
- Verify `showOnPublicCard: true` is set
- Check that field values exist in vehicle data
- Verify VehicleCard component is fetching fields
- Check browser console for errors

---

## Future Enhancements

Potential improvements for future releases:
- Conditional formulas (IF/THEN logic)
- String concatenation in formulas
- Date calculations
- Percentage formatting options
- Currency conversion support
- Formula validation and error handling UI
- Field dependencies visualization
- Bulk update display options for multiple fields

---

**Last Updated**: 2026-01-09  
**Version**: 1.0
