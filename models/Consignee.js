import mongoose from "mongoose";

const consigneeSchema = new mongoose.Schema({
    name:            { type: String, required: true },
    email:           { type: String },
    phone:           { type: String },
    company:         { type: String },
    vat:             { type: String },
    address:         { type: String },
    city:            { type: String },
    country:         { type: String },
    notes:           { type: String },
    label:           { type: String }, // Presold label
    purchasedAmount: { type: Number }, // Pre-sold purchase amount
}, { timestamps: true });

export default mongoose.models.Consignee || mongoose.model('Consignee', consigneeSchema);
