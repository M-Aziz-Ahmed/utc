import mongoose from "mongoose";

const DynFeildsSchema= new mongoose.Schema({   
    label : { type: String},
    type : { type: String},
    isRequired  : { type: Boolean},
    belongsto : { type: String}
});
export default mongoose.models.DynFeilds || mongoose.model('DynFeilds', DynFeildsSchema)