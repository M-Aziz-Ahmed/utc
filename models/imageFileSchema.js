import mongoose from "mongoose";

// NOTE: `type` is a reserved key in inline mongoose subdoc arrays
// (e.g. `images: [{ type: String, ... }]` is parsed as an array of strings).
// It must be defined inside a real Schema to work correctly.
const imageFileSchema = new mongoose.Schema({
    name: String,
    path: String,
    size: Number,
    type: String,
    uploadedAt: { type: Date, default: Date.now }
}, { strict: false });

export default imageFileSchema;
