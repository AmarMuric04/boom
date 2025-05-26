import mongoose, { type Document, Schema } from "mongoose"

export interface IFollow extends Document {
  _id: string
  follower: mongoose.Types.ObjectId
  following: mongoose.Types.ObjectId
  createdAt: Date
}

const FollowSchema = new Schema<IFollow>(
  {
    follower: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    following: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

// Ensure unique follow relationships
FollowSchema.index({ follower: 1, following: 1 }, { unique: true })

// Update follower/following counts
FollowSchema.post("save", async function () {
  const User = mongoose.model("User")

  // Update following count for follower
  await User.findByIdAndUpdate(this.follower, {
    $addToSet: { following: this.following },
  })

  // Update followers count for the followed user
  await User.findByIdAndUpdate(this.following, {
    $addToSet: { followers: this.follower },
  })
})

FollowSchema.post("deleteOne", { document: true }, async function () {
  const User = mongoose.model("User")

  // Remove from following list
  await User.findByIdAndUpdate(this.follower, {
    $pull: { following: this.following },
  })

  // Remove from followers list
  await User.findByIdAndUpdate(this.following, {
    $pull: { followers: this.follower },
  })
})

export default mongoose.models.Follow || mongoose.model<IFollow>("Follow", FollowSchema)
