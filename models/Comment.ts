import mongoose, { type Document, Schema } from "mongoose";

export interface IComment extends Document {
  _id: string;
  content: string;
  author: mongoose.Types.ObjectId;
  video: mongoose.Types.ObjectId;
  likes: mongoose.Types.ObjectId[];
  replies: mongoose.Types.ObjectId[];
  parentComment?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    replies: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Comment ||
  mongoose.model<IComment>("Comment", CommentSchema);
