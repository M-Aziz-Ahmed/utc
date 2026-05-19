import mongoose from "mongoose";

const userSchema  = new mongoose.Schema({ 
    name:{ type: String, required: true },
    email:{ type: String, required: true },
    pass:{ type: String, required: true },
    role:{ type: String, required: true },
    verified:{ type: String, required: true },
    number:{ type: String, required: true },
})
export default mongoose.models.User || mongoose.model('User', userSchema)