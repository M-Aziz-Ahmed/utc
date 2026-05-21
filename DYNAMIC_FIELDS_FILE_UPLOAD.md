# Dynamic Fields File Upload Feature

## Overview
Added comprehensive file upload functionality to the Dynamic Fields system, allowing users to create custom file and image upload fields that can be used in any form.

## Features Added

### 1. New Field Types
- **`file`** - Generic file upload field (accepts all file types)
- **`image`** - Image-only upload field (accepts image/* types)

### 2. Dynamic Field File Upload UI
When a dynamic field of type `file` or `image` is created, it automatically renders:
- Click-to-upload button with visual styling
- Multiple file support
- Image previews for uploaded images
- File icons for documents
- File size display
- Individual remove buttons for each file
- Required field validation

### 3. Form Integration
- Dynamic file fields seamlessly integrate with the setupUser form
- Files from dynamic fields are handled separately from main form files
- All files are uploaded to the same directory structure
- File metadata is stored in the user document

### 4. Backend Processing
- Dynamic field files are prefixed with `dynamic_{fieldLabel}_` in FormData
- Files are saved with unique timestamps and random strings to prevent conflicts
- File paths are stored in the database under their respective field labels
- Supports multiple files per dynamic field

## How to Use

### Creating a File Upload Field
1. Go to the Dynamic Fields page (`/fields`)
2. Fill in the form:
   - **Label**: e.g., "Profile Picture" or "Documents"
   - **Type**: Select either `file` or `image`
   - **Required**: Choose if the field is mandatory
   - **Belongs to form**: Enter "setupUser" to show it on the user registration form
3. Click "Create Field"

### Using the Field
1. Go to the setupUser page (`/setupUser`)
2. The dynamic file field will appear in the "Additional Info" section
3. Click "Add Images" or "Add Files" to select files
4. Multiple files can be added
5. Preview and remove files as needed
6. Submit the form to save

## Technical Details

### File Storage
- **Location**: `public/uploads/users/`
- **Naming**: `{timestamp}_{randomString}_{originalFileName}`
- **Access**: Files are publicly accessible via `/uploads/users/{filename}`

### Database Schema
- User model uses `{ strict: false }` to accept dynamic fields
- Dynamic file fields are stored as arrays of file objects:
  ```javascript
  {
    name: "original-filename.jpg",
    path: "/uploads/users/123456_abc_original-filename.jpg",
    size: 12345,
    type: "image/jpeg"
  }
  ```

### FormData Structure
- Main files: `file_0`, `file_1`, etc.
- Dynamic field files: `dynamic_{fieldLabel}_0`, `dynamic_{fieldLabel}_1`, etc.
- User data: `userData` (JSON string)

## Files Modified
- ✅ `app/fields/page.jsx` - Added "file" and "image" to field types
- ✅ `app/setupUser/page.jsx` - Added dynamic file field rendering
- ✅ `app/api/createUser/route.js` - Added dynamic file processing
- ✅ `models/User.js` - Added `{ strict: false }` for dynamic fields

## Example Use Cases
1. **Profile Picture** - Create an "image" field for user avatars
2. **ID Documents** - Create a "file" field for verification documents
3. **Certificates** - Create a "file" field for professional certificates
4. **Company Logo** - Create an "image" field for business users
5. **Portfolio Images** - Create an "image" field for creative professionals

## Security Considerations
- Implement file size limits in production
- Add file type validation on the server
- Consider using cloud storage (S3, Cloudinary) for production
- Add virus scanning for uploaded files
- Implement proper access control for file viewing
