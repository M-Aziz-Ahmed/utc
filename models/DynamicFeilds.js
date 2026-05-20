import mongoose from "mongoose";
import { isReactCompilerRequired } from "next/dist/build/swc";

const DynFeildsSchema= new mongoose.Schema({   
    label : { type: String},
    type : { type: String},
    isRequired  : { type: Boolean},
    belongsto : { type: String}
});
export default mongoose.models.DynFeilds || mongoose.model('DynFeilds', DynFeildsSchema)