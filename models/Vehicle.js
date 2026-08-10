import mongoose from "mongoose";
import imageFileSchema from "./imageFileSchema.js";

const vehicleSchema = new mongoose.Schema({
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    files: [imageFileSchema],
    // Allocation and Rikuso fields
    allocation: { type: String, enum: ['export', 'khitai', 'resale-to-auction', ''], default: '' },
    allocationStatus: { type: Boolean, default: false },
    rikusoStatus: { type: Boolean, default: false },
    consignee: { type: mongoose.Schema.Types.ObjectId, ref: 'Consignee' },
    rikusoCompany: { type: mongoose.Schema.Types.ObjectId, ref: 'Manufacturer' },
    // Whether the vehicle is visible on the public website
    // (only set once admin approves its gate pass photos in the review portal)
    published: { type: Boolean, default: false },
    // Sequential, human-friendly stock number assigned automatically on creation (1, 2, 3, ...)
    stockId: { type: Number },
    // Photos taken when the car physically arrives (uploaded during In Gate Pass)
    gatePassImages: [imageFileSchema]
}, { 
    strict: false, // Allow dynamic fields
    timestamps: true 
});

vehicleSchema.index({ allocation: 1, allocationStatus: 1 });
vehicleSchema.index({ rikusoStatus: 1 });
vehicleSchema.index({ createdBy: 1 });
vehicleSchema.index({ consignee: 1 });
vehicleSchema.index({ rikusoCompany: 1 });
vehicleSchema.index({ stockId: 1 });

vehicleSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

vehicleSchema.set('toJSON', { virtuals: true });

export default mongoose.models.Vehicle || mongoose.model('Vehicle', vehicleSchema);
