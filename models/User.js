import mongoose from "mongoose";

const userSchema  = new mongoose.Schema({ 
    name:{ type: String},
    email:{ type: String},
    pass:{ type: String},
    role:{ type: String},
    verified:{ type: String},
    number:{ type: String},
})
export default mongoose.models.User || mongoose.model('User', userSchema)