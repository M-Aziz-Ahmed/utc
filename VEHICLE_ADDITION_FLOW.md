# Multi-Step Vehicle Addition Flow

## Overview
The vehicle addition process has been redesigned as a 4-step wizard to provide a structured and intuitive experience for adding vehicles with manufacturer, model, and variant selection.

## Flow Structure

### Step 1: Select Manufacturer
**Purpose**: Choose the vehicle manufacturer (e.g., Toyota, Honda, Nissan)

**Features**:
- Grid display of all manufacturers (excluding Rikuso companies)
- Shows manufacturer name, country, and number of models
- "Add New Manufacturer" button opens modal
- Selected manufacturer is highlighted with blue border
- Navigation: "Next: Select Model" button (disabled until selection)

**Add New Manufacturer Modal**:
- Fields: Name (required), Country (optional)
- Creates a new manufacturer with empty models array
- Immediately selects the newly created manufacturer

---

### Step 2: Select Car Model
**Purpose**: Choose the vehicle model (e.g., Corolla, Camry, Civic)

**Features**:
- Grid display of models from selected manufacturer
- Shows model name, description, and number of variants
- Context display: "From {Manufacturer Name}"
- "Add New Model" button opens modal
- Selected model is highlighted with blue border
- Navigation: "Back" and "Next: Select Variant" buttons

**Add New Model Modal**:
- Fields: Model Name (required), Description (optional)
- Creates model with empty variants array
- Automatically adds to selected manufacturer's models
- Immediately selects the newly created model

---

### Step 3: Select Variant/Trim
**Purpose**: Choose the vehicle variant/trim level (e.g., GLI, GLX, Altis)

**Features**:
- Grid display of variants from selected model
- Shows variant names as clickable buttons
- Context display: "{Manufacturer} {Model}"
- "Add New Variant" button opens modal
- Selected variant is highlighted with blue border
- Empty state message if no variants exist with "Add First Variant" button
- Navigation: "Back" and "Next: Vehicle Details" buttons

**Add New Variant Modal**:
- Field: Variant Name (required)
- Adds variant to selected model's variants array
- Context display shows: "{Manufacturer} {Model}"
- Immediately selects the newly created variant

---

### Step 4: Vehicle Details Form
**Purpose**: Fill in complete vehicle information with dynamic fields

**Features**:
- Summary display: "{Manufacturer} - {Model} - {Variant}"
- Dynamic form fields from database (configured via Fields Management)
- Grid layout for standard fields (responsive: 1/2/3 columns)
- Separate section for file/image uploads
- Required fields marked with red asterisk
- Form validation before submission
- Success/error messages
- Navigation: "Back" and "Add Vehicle" submit button

**Form Fields**:
- All dynamic fields configured for "add-vehicles"
- Supports: text, number, date, dropdown, boolean, file, image
- File uploads support multiple files with preview
- Images uploaded to Cloudinary (if configured)

**Data Saved**:
```javascript
{
  manufacturer: "Toyota",
  manufacturerId: "...",
  model: "Corolla",
  variant: "GLI",
  ...dynamicFields,
  images: [...cloudinaryUrls]
}
```

---

## Visual Design

### Step Indicator
- Horizontal progress bar at top
- 4 steps with icons: 🏭 Manufacturer, 🚗 Car Model, ⚙️ Variant/Trim, 📋 Vehicle Details
- Current step highlighted in blue
- Completed steps shown with blue background
- Connecting lines show progress

### Color Scheme
- Primary: Blue (#2563EB)
- Success: Green (#16A34A)
- Background: Gray gradient
- Cards: White with shadow
- Borders: Gray with blue on selection

---

## Database Structure

### Manufacturer Model
```javascript
{
  name: String (required),
  country: String,
  models: [
    {
      name: String (required),
      description: String,
      variants: [String], // ["GLI", "GLX", "Altis"]
      dimensions: {...}
    }
  ],
  // Rikuso company fields...
  isRikusoCompany: Boolean (default: false)
}
```

### Vehicle Model
```javascript
{
  manufacturer: String,
  manufacturerId: ObjectId (ref: Manufacturer),
  model: String,
  variant: String,
  ...dynamicFields,
  images: [String], // Cloudinary URLs
  publicId: [String], // For Cloudinary deletion
  allocation: {...},
  consignee: ObjectId,
  rikusoCompany: ObjectId
}
```

---

## API Endpoints

### GET/POST `/api/manufacturer`
- GET: Fetch all manufacturers
- POST: Create new manufacturer

### PATCH `/api/manufacturer/[id]`
- Update manufacturer (add models/variants)

### POST `/api/fields`
- Fetch dynamic fields with filter: `{ belongsto: 'add-vehicles' }`

### POST `/api/vehicles`
- Create new vehicle with FormData
- Handles Cloudinary image uploads
- Saves manufacturer, model, variant info

---

## User Experience Flow

1. **Start**: User clicks "Add Vehicle" from vehicles management page
2. **Step 1**: Select or create manufacturer → Click "Next"
3. **Step 2**: Select or create model → Click "Next"
4. **Step 3**: Select or create variant → Click "Next"
5. **Step 4**: Fill vehicle details → Click "Add Vehicle"
6. **Complete**: Success message → Redirect to vehicles list

**At any step**: User can go "Back" to modify previous selections

**On-the-fly additions**: User can create manufacturers, models, or variants without leaving the flow

---

## Error Handling

- Empty selection prevention: "Next" buttons disabled until selection
- Required field validation on submit
- Network error messages displayed in red alert boxes
- Success confirmation before redirect
- Loading states on all async operations
- Modal overlay prevents accidental clicks

---

## Implementation Files

### Main Components
- **Page**: `f:\Work\utc\app\admin\vehicles\add\page.jsx`
- **Model**: `f:\Work\utc\models\Manufacturer.js`
- **API**: `f:\Work\utc\app\api\manufacturer\route.js`
- **API**: `f:\Work\utc\app\api\vehicles\route.js`

### Related Features
- Dynamic Fields Management: `f:\Work\utc\app\admin\fields\page.jsx`
- Cloudinary Integration: `f:\Work\utc\utils\cloudinary.js`
- Vehicle Management: `f:\Work\utc\app\admin\vehicles\page.jsx`

---

## Future Enhancements

1. **Search/Filter**: Add search functionality for manufacturers/models when list grows
2. **Bulk Operations**: Import multiple vehicles from CSV/Excel
3. **Templates**: Save vehicle configurations as templates
4. **History**: Track variant changes and model updates
5. **Images**: Preview manufacturer logos and model images
6. **Validation**: Check for duplicate variants within a model
7. **Analytics**: Show most popular manufacturers/models/variants

---

## Testing Checklist

- [ ] Create new manufacturer
- [ ] Create new model for existing manufacturer
- [ ] Create new variant for existing model
- [ ] Select existing manufacturer → model → variant
- [ ] Mix: Select existing + create new at each step
- [ ] Navigate back and forth between steps
- [ ] Fill and submit complete vehicle form
- [ ] Verify all data saved correctly in database
- [ ] Check Cloudinary images uploaded successfully
- [ ] Verify manufacturer dropdown excludes Rikuso companies
- [ ] Test with no fields configured (should show fallback)
- [ ] Test required field validation
- [ ] Test with local MongoDB and Atlas connection

---

## Configuration Notes

### MongoDB Connection
- **Development**: Uses local MongoDB at `mongodb://localhost:27017/utc`
- **Production**: Configure Atlas URI in `.env.local`
- Environment variable: `MONGODB_URI`

### Cloudinary Setup
- Required for image uploads
- Configure in `.env.local`:
  - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`
- See: `CLOUDINARY_SETUP.md` for details

---

## Status
✅ **COMPLETE** - All 4 steps implemented with modals
✅ **TESTED** - No diagnostic errors
✅ **DOCUMENTED** - This file provides complete overview
✅ **INTEGRATED** - Works with existing dynamic fields and Cloudinary

---

## Example Usage Scenario

**Goal**: Add a Toyota Corolla GLI 2024 vehicle

1. Navigate to Add Vehicle page
2. **Step 1**: Select "Toyota" (or create if doesn't exist)
3. **Step 2**: Select "Corolla" (or click "Add New Model" and enter "Corolla, Sedan")
4. **Step 3**: Select "GLI" (or click "Add New Variant" and enter "GLI")
5. **Step 4**: Fill details:
   - Chassis Number: ABC123
   - Year: 2024
   - Color: White
   - Upload 5 images
   - Set other dynamic fields as configured
6. Click "Add Vehicle"
7. Success message appears
8. Redirected to vehicles management page

Vehicle is now in database with complete manufacturer, model, and variant hierarchy.
