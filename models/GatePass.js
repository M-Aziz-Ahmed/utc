import mongoose from "mongoose";

const gatePassSchema = new mongoose.Schema({
    vehicle:        { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    type:           { type: String, enum: ['IGP', 'OGP'], required: true },
    gatePassNumber: { type: String },
    date:           { type: Date, default: Date.now },
    yard:           { type: mongoose.Schema.Types.ObjectId, ref: 'Yard' },
    containerNumber:{ type: String },
    blNumber:       { type: String },
    consignee:      { type: mongoose.Schema.Types.ObjectId, ref: 'Consignee' },
    status:         { type: String, enum: ['pending', 'approved', 'completed', 'cancelled'], default: 'pending' },
    remarks:        { type: String },
    createdBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    images: [{
        name: String,
        path: String,
        size: Number,
        type: String,
        uploadedAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

export default mongoose.models.GatePass || mongoose.model('GatePass', gatePassSchema);
