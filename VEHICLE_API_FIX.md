# Vehicle API CastError Fix

## Problem
When submitting the add vehicle form with files, the API was throwing a CastError:
```
CastError at path "files.0" because of "CastError"
```

The error showed that `files` was being received as a stringified JSON array instead of an actual array object.

## Root Cause
The issue occurred because:
1. Dynamic field files were being processed and their metadata was being included in the `body` object
2. When spreading `{ ...body }`, any stringified file arrays were being copied over
3. Then we tried to add the actual file arrays, causing a type conflict
4. Mongoose couldn't cast the string to the expected schema type

## Solution
Updated the API to:
1. **Filter out file-related fields** from the parsed body before creating vehicle data
2. **Detect stringified arrays** that look like file metadata and skip them
3. **Only add actual file arrays** that we processed from FormData uploads
4. **Explicitly exclude 'files' field** from body to avoid conflicts

### Code Changes
```javascript
// Create a clean object for vehicle data
const vehicleData = {};
Object.keys(body).forEach(key => {
    const value = body[key];
    // Skip any field that looks like it contains file data
    if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
        try {
            const parsed = JSON.parse(value);
            // If it's an array of objects with file-like properties, skip it
            if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].name && parsed[0].path) {
                return; // Skip this field
            }
        } catch (e) {
            // Not JSON, include it
        }
    }
    // Skip 'files' field to avoid conflicts
    if (key !== 'files') {
        vehicleData[key] = value;
    }
});

// Add files to vehicle data only if we have uploaded files
if (uploadedFiles.length > 0) {
    vehicleData.files = uploadedFiles;
}

// Add dynamic field files to vehicleData
if (Object.keys(dynamicFieldFiles).length > 0) {
    Object.entries(dynamicFieldFiles).forEach(([fieldLabel, files]) => {
        vehicleData[fieldLabel] = files;
    });
}
```

## Testing
To verify the fix:
1. Go to `/vehclemanagement/add-vehicles`
2. Fill in form fields
3. Upload multiple images/files
4. Submit the form
5. Should see success message without CastError

## Prevention
This fix ensures that:
- Only properly formatted file arrays are stored in the database
- Stringified file data is filtered out before database insertion
- No type conflicts occur between string and array types
- The Vehicle model receives data in the expected format
