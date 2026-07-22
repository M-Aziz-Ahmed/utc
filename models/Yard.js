import mongoose from "mongoose";

const yardSchema = new mongoose.Schema({
    name:     { type: String, required: true },
    location: { type: String },
    address:  { type: String },
    city:     { type: String },
    country:  { type: String },
    capacity: { type: Number },
    notes:    { type: String },
}, { timestamps: true });

export default mongoose.models.Yard || mongoose.model('Yard', yardSchema);
