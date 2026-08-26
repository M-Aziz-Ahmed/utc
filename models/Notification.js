import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type:      { type: String, enum: ['vehicle_added', 'allocation_changed', 'gate_pass', 'export_cert', 'account_updated', 'general'], default: 'general' },
    message:   { type: String, required: true },
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
    read:      { type: Boolean, default: false },
    link:      { type: String },
}, { timestamps: true });

notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ createdAt: -1 });

export default mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
