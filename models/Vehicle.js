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
    }]
}, { 
    strict: false, // Allow dynamic fields
    timestamps: true 
});

export default mongoose.models.Vehicle || mongoose.model('Vehicle', vehicleSchema);
