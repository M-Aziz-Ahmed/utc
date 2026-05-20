import mongoose from "mongoose";

const userSchema  = new mongoose.Schema({ 
    email:{ type: String},
    pass:{ type: String},
    name:{ type: String},
    surname:{ type: String},
    lang:{ type: String},
    cellphone:{ type: String},
    company:{ type: String},
    companyvat:{ type: String},
    web:{ type: String},
    streetno:{ type: String},
    city:{ type: String},
    postcode:{ type: String},
    country:{ type: String},
    newsletter:{ type: Boolean},
    newpurchase:{ type: Boolean},
    role:{ type: String},
    verified:{ type: String},
    
})
export default mongoose.models.User || mongoose.model('User', userSchema)