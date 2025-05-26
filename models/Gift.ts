import mongoose, { type Document, Schema } from "mongoose"

export interface IGift extends Document {
  _id: string
  sender: mongoose.Types.ObjectId
  recipient: mongoose.Types.ObjectId
  video?: mongoose.Types.ObjectId
  amount: number
  message?: string
  createdAt: Date
}

const GiftSchema = new Schema<IGift>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    message: {
      type: String,
      maxlength: 200,
      default: "",
    },
  },
  {
    timestamps: true,
  },
)

// Update wallet balances after gift
GiftSchema.post("save", async function () {
  const User = mongoose.model("User")

  // Deduct from sender's wallet
  await User.findByIdAndUpdate(this.sender, {
    $inc: { wallet: -this.amount },
  })

  // Add to recipient's wallet and earnings
  await User.findByIdAndUpdate(this.recipient, {
    $inc: {
      wallet: this.amount,
      totalEarnings: this.amount,
    },
  })
})

export default mongoose.models.Gift || mongoose.model<IGift>("Gift", GiftSchema)
