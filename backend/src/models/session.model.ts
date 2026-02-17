import mongoose, { Schema, Document } from "mongoose";

export interface ISession extends Document {
  user: mongoose.Types.ObjectId;
  refreshTokenHash: string;
  userAgent?: string;
  ip?: string;
  createdAt: Date;
  lastUsedAt?: Date;
  expiresAt: Date;
  revokedAt?: Date | null;
}

const sessionSchema = new Schema<ISession>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    refreshTokenHash: {
      type: String,
      required: true,
      index: true, // ❌ remove unique
    },

    userAgent: String,
    ip: String,

    lastUsedAt: {
      type: Date,
      default: Date.now,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    revokedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// Auto delete expired sessions
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Auto delete revoked sessions after 5 days
sessionSchema.index({ revokedAt: 1 }, { expireAfterSeconds: 5 * 24 * 60 * 60 });

export const Session =
  mongoose.models.Session || mongoose.model<ISession>("Session", sessionSchema);

export default Session;
