import mongoose, { type Document, Schema } from "mongoose"

export interface IVideo extends Document {
  _id: string
  title: string
  description: string
  creator: mongoose.Types.ObjectId
  type: "short-form" | "long-form"
  videoUrl?: string
  videoFile?: string
  thumbnail?: string
  duration?: string
  price: number
  isPremium: boolean
  tags: string[]
  views: number
  likes: mongoose.Types.ObjectId[]
  comments: mongoose.Types.ObjectId[]
  purchases: mongoose.Types.ObjectId[]
  earnings: number
  isActive: boolean
  uploadDate: Date
}

const VideoSchema = new Schema<IVideo>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["short-form", "long-form"],
      required: true,
    },
    videoUrl: {
      type: String,
      default: "",
    },
    videoFile: {
      type: String,
      default: "",
    },
    thumbnail: {
      type: String,
      default: "",
    },
    duration: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    views: {
      type: Number,
      default: 0,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    purchases: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    earnings: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

// Update creator's total videos count
VideoSchema.post("save", async function () {
  const User = mongoose.model("User")
  await User.findByIdAndUpdate(this.creator, {
    $inc: { totalVideos: 1 },
  })
})

export default mongoose.models.Video || mongoose.model<IVideo>("Video", VideoSchema)
