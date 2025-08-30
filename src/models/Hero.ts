import mongoose, { Document, Schema } from "mongoose";

export interface Hero extends Document {
  media: {
    type: "image" | "video";
    src: string;
  };
  gender: "men" | "women" | "kids" | "baby";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const heroSchema = new Schema<Hero>(
  {
    media: {
      type: {
        type: String,
        enum: ["image", "video"],
        required: true,
      },
      src: {
        type: String,
        required: true,
      },
    },
    gender: {
      type: String,
      enum: ["men", "women", "kids", "baby"],
      required: true,
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

// Index for efficient queries
heroSchema.index({ gender: 1, isActive: 1 });

export default mongoose.model<Hero>("Hero", heroSchema);
