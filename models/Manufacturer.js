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
    variants:    [{ type: String }], // Array of variant names (GLI, GLX, Altis, etc.)
});

const manufacturerSchema = new mongoose.Schema({
    name:    { type: String, required: true },
    country: { type: String },
    models:  [carModelSchema],
    // Rikuso company fields
    companyName: { type: String },
    contactPerson: { type: String },
    tel: { type: String },
    bankName: { type: String },
    accountTitle: { type: String },
    accountNumber: { type: String },
    mob: { type: String },
    telSharp: { type: String },
    fax: { type: String },
    email: { type: String },
    address: { type: String },
    isRikusoCompany: { type: Boolean, default: false }
}, { strict: false, timestamps: true });

export default mongoose.models.Manufacturer || mongoose.model('Manufacturer', manufacturerSchema);
