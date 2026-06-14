import mongoose from "mongoose";

const auctionGroupSchema = new mongoose.Schema({
     name: {
    type: String,
    required: true
  },
  options: [
    {}
  ]
});

export default mongoose.model.AuctionGroup || mongoose.model("AuctionGroup", auctionGroupSchema);
