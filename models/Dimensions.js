import mongoose from "mongoose";

const dimensionsSchema = new mongoose.Schema({
    name:         { type: String, required: true },
    length:       { type: Number },
    width:        { type: Number },
    height:       { type: Number },
    weight:       { type: Number },
    unit_length:  { type: String, default: 'cm' },
    unit_weight:  { type: String, default: 'kg' },
    notes:        { type: String },
}, { strict: false, timestamps: true });

export default mongoose.models.Dimensions || mongoose.model('Dimensions', dimensionsSchema);
