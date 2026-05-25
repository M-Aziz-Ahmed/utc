import mongoose from "mongoose";

const dimensionsSchema = new mongoose.Schema({
    length:      { type: Number },
    width:       { type: Number },
    height:      { type: Number },
    weight:      { type: Number },
    unit_size:   { type: String, default: 'cm' },
    unit_weight: { type: String, default: 'kg' },
}, { _id: false });

const carModelSchema = new mongoose.Schema({
    name:        { type: String, required: true },
    description: { type: String },
    dimensions:  { type: dimensionsSchema, default: () => ({}) },
});

const manufacturerSchema = new mongoose.Schema({
    name:    { type: String, required: true },
    country: { type: String },
    models:  [carModelSchema],
}, { strict: false, timestamps: true });

export default mongoose.models.Manufacturer || mongoose.model('Manufacturer', manufacturerSchema);
