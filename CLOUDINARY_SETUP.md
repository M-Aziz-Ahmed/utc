# Cloudinary Integration Guide

## ✅ What's Been Done

1. **Installed Cloudinary SDK**
   - Package: `cloudinary`
   
2. **Created Cloudinary utility** (`utils/cloudinary.js`)
   - Configuration setup
   - Upload helper function
   - Delete helper function

3. **Updated Vehicles API** (`app/api/vehicles/route.js`)
   - Now uploads images to Cloudinary instead of local storage
   - Stores Cloudinary URLs in database
   - Includes publicId for future deletion

4. **Updated Next.js config** (`next.config.mjs`)
   - Added Cloudinary domain to allowed image sources

## 🔧 Setup Instructions

### 1. Get Your Cloudinary Credentials

1. Go to https://cloudinary.com/
2. Sign up or log in
3. Go to your **Dashboard**
4. Copy these three values:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### 2. Update .env.local

Replace the placeholder values in `.env.local`:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
CLOUDINARY_API_KEY=your_actual_api_key
CLOUDINARY_API_SECRET=your_actual_api_secret
```

### 3. Restart Your Server

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

## 📁 Folder Structure in Cloudinary

Images will be organized as:
```
utc/
  └── vehicles/
      ├── image1.jpg
      ├── image2.png
      └── ...
```

## 🎯 Features

### Automatic Benefits:
- ✅ **Cloud Storage**: No more local file storage
- ✅ **CDN Delivery**: Fast image loading worldwide
- ✅ **Image Optimization**: Automatic format conversion and compression
- ✅ **Transformations**: Resize, crop, and optimize on-the-fly
- ✅ **Backup**: Images are stored in the cloud
- ✅ **Scalability**: No server storage limits

### What Works Now:
- Vehicle image uploads go to Cloudinary
- Images are accessible via Cloudinary URLs
- All existing vehicle functionality works
- Rikuso page displays Cloudinary images

## 🔄 Migration (Optional)

If you want to migrate existing local images to Cloudinary:

1. Create a migration script (we can do this if needed)
2. Upload all images from `public/uploads/vehicles/` to Cloudinary
3. Update database records with new Cloudinary URLs
4. Delete local images

## 🛠️ Advanced Usage

### Image Transformations

Cloudinary URLs support on-the-fly transformations:

```javascript
// Original URL
https://res.cloudinary.com/your-cloud/image/upload/v1234567890/utc/vehicles/image.jpg

// Resize to 300x300
https://res.cloudinary.com/your-cloud/image/upload/w_300,h_300,c_fill/v1234567890/utc/vehicles/image.jpg

// Convert to WebP
https://res.cloudinary.com/your-cloud/image/upload/f_auto,q_auto/v1234567890/utc/vehicles/image.jpg
```

### Using in Frontend

```jsx
// Using Next.js Image component with Cloudinary
import Image from 'next/image'

<Image
  src="https://res.cloudinary.com/your-cloud/image/upload/utc/vehicles/image.jpg"
  alt="Vehicle"
  width={500}
  height={300}
  quality={75}
/>
```

## 📊 Monitoring

Check your Cloudinary dashboard for:
- Storage usage
- Bandwidth usage
- Transformations
- API requests

## 🆓 Free Tier Limits

Cloudinary free tier includes:
- **25 GB** storage
- **25 GB** monthly bandwidth
- **25,000** transformations/month
- **10 GB** video storage

This is usually enough for small to medium projects.

## 🔒 Security

- API credentials are stored in `.env.local` (not committed to Git)
- Only server-side code can upload/delete images
- Frontend can only display images
- Use signed URLs for private images if needed

## 🐛 Troubleshooting

### Images not uploading?
1. Check if Cloudinary credentials are correct in `.env.local`
2. Restart your Next.js server after updating `.env.local`
3. Check browser console for errors
4. Check server terminal for error messages

### Images not displaying?
1. Check if the URL is correct in the database
2. Verify `next.config.mjs` has the Cloudinary domain
3. Check browser console for CORS errors
4. Restart Next.js server after config changes

## 📝 Next Steps

To complete the integration for other parts of your app:

1. **User Profile Images** - Update user upload endpoints
2. **Setup User Page** - Update the setupUser upload logic
3. **Image Deletion** - Implement cleanup when vehicles are deleted
4. **Image Gallery** - Add better image viewing with Cloudinary transformations

Let me know if you need help with any of these!
