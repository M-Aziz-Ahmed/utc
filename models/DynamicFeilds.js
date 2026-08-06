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
    linkedField:{ type: String, default: '' },
    linkedFields: [{ type: String }],
    vehicleField:{ type: String, default: '' },
    // Formula field properties
    formulaFields: [{ 
        field: { type: String },
        operation: { type: String, enum: ['add', 'subtract', 'multiply', 'divide'], default: 'add' }
    }],
    // Display options
    displayAsPrice: { type: Boolean, default: false },
    showOnPublicCard: { type: Boolean, default: false },
});

export default mongoose.models.DynFeilds || mongoose.model('DynFeilds', DynFeildsSchema);
