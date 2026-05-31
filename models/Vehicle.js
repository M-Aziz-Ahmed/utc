import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema({
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    files: [{ 
        name: String,
        path: String,
        size: Number,
        type: String,
        uploadedAt: { type: Date, default: Date.now }
    }],
    // Allocation and Rikuso fields
    allocation: { type: String, enum: ['export', 'khitai', 'resale-to-auction', ''], default: '' },
    allocationStatus: { type: Boolean, default: false },
    rikusoStatus: { type: Boolean, default: false },
    consignee: { type: mongoose.Schema.Types.ObjectId, ref: 'Consignee' },
    rikusoCompany: { type: mongoose.Schema.Types.ObjectId, ref: 'Manufacturer' }
}, { 
    strict: false, // Allow dynamic fields
    timestamps: true 
});

export default mongoose.models.Vehicle || mongoose.model('Vehicle', vehicleSchema);
