import mongoose from "mongoose";

const auctionGroupSchema = new mongoose.Schema({
     name: {
    type: String,
    required: true
  },
  options: {type:Array, default: []},
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model.AuctionGroup || mongoose.Model("AuctionGroup", auctionGroupSchema);
