import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema({
    name:       { type: String, required: true },
    email:      { type: String },
    phone:      { type: String },
    company:    { type: String },
    vat:        { type: String },
    address:    { type: String },
    city:       { type: String },
    country:    { type: String },
    notes:      { type: String },
}, { timestamps: true });

export default mongoose.models.Supplier || mongoose.model('Supplier', supplierSchema);
