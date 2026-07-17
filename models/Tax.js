import mongoose from "mongoose";

const TaxSchema = new mongoose.Schema({
    name:       { type: String, required: true },
    rate:       { type: Number, required: true },
    type:       { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
    code:       { type: String },
    description:{ type: String },
    active:     { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.Tax || mongoose.model('Tax', TaxSchema);
