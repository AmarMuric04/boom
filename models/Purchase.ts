import mongoose, { type Document, Schema } from "mongoose";

export interface IPurchase extends Document {
  user: mongoose.Types.ObjectId;
  video: mongoose.Types.ObjectId;
  amount: number;
  createdAt: Date;
}

const PurchaseSchema = new Schema<IPurchase>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate purchases
PurchaseSchema.index({ user: 1, video: 1 }, { unique: true });

export default mongoose.models.Purchase ||
  mongoose.model<IPurchase>("Purchase", PurchaseSchema);
