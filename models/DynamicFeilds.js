import mongoose from "mongoose";

const DynFeildsSchema = new mongoose.Schema({
    label:      { type: String },
    type:       { type: String },
    isRequired: { type: Boolean },
    belongsto:  { type: String },
    options:    [{ type: String }],
    order:      { type: Number, default: 0 },
    showOnCard: { type: Boolean, default: true },
    linkedTax:  { type: mongoose.Schema.Types.ObjectId, ref: 'Tax', default: null },
});

export default mongoose.models.DynFeilds || mongoose.model('DynFeilds', DynFeildsSchema);
