import mongoose from "mongoose";

const DynFeildsSchema= new mongoose.Schema({   
    label : { type: String},
    type : { type: String},
    isRequired  : { type: Boolean},
    belongsto : { type: String},
    options: [{ type: String }]  // Array of options for dropdown type
});
export default mongoose.models.DynFeilds || mongoose.model('DynFeilds', DynFeildsSchema)