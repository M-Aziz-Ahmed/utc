import mongoose from 'mongoose';
const auctionDetailsSchema = new mongoose.Schema({
    record:{type: Object}
});
export default mongoose.models.AuctionDetails || mongoose.model('AuctionDetails', auctionDetailsSchema);