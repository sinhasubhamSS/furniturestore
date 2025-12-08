// components/reviews/PostReviewModal.tsx
"use client";
import React, { useState, useEffect } from "react";
import {
  useCreateReviewMutation,
  useUpdateReviewMutation,
} from "@/redux/services/user/reviewApi";
import StarRating from "../ui/StarRating";
import ActionButton from "../ui/ActionButton";
import { toast } from "react-hot-toast";
import { ReviewDisplayType } from "@/types/review";
import { Send, X } from "lucide-react";
import { uploadImageToCloudinary } from "../../../utils/uploadToCloudinary";

// small helper to make a short local id for temp previews
const makeLocalId = () =>
  `local-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;

interface MediaItem {
  url: string;
  publicId?: string; // cloudinary public_id (camelCase)
  public_id?: string; // cloudinary public_id (snake_case) — mapped into publicId on load
  caption?: string | undefined;
  thumbSafe?: string | undefined;
  _tmp?: boolean; // internal: temporary preview before upload
  _localId?: string; // internal: temporary stable key until publicId arrives
}

interface PostReviewModalProps {
  productId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  existingReview?: ReviewDisplayType | null;
  initialRating?: number; // from QuickRating
  orderId?: string; // optional — if provided, backend will mark verified
}

const PostReviewModal: React.FC<PostReviewModalProps> = ({
  productId,
  isOpen,
  onClose,
  onSuccess,
  existingReview = null,
  initialRating,
  orderId,
}) => {
  const [rating, setRating] = useState(initialRating || 0);
  const [content, setContent] = useState("");
  const [images, setImages] = useState<MediaItem[]>([]);
  const [videos, setVideos] = useState<MediaItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0); // 0-100 aggregated

  const [createReview, { isLoading: isCreating }] = useCreateReviewMutation();
  const [updateReview, { isLoading: isUpdating }] = useUpdateReviewMutation();

  const isEditing = !!existingReview;
  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (isOpen) {
      if (existingReview) {
        setRating(existingReview.rating);
        setContent(existingReview.content || "");
        // Map existing review images/videos (backend shape -> local shape)
        setImages(
          (existingReview.images || []).map((img: any) => ({
            url: img.url,
            publicId: img.publicId || img.public_id || "",
            public_id: img.public_id || img.publicId || "",
            caption: img.caption || undefined,
            thumbSafe: (img as any).thumbSafe || undefined,
            _tmp: false,
            _localId: makeLocalId(),
          }))
        );
        setVideos(
          (existingReview.videos || []).map((v: any) => ({
            url: v.url,
            publicId: v.publicId || v.public_id || "",
            public_id: v.public_id || v.publicId || "",
            caption: v.thumbnail || v.caption || undefined,
            _tmp: false,
            _localId: makeLocalId(),
          }))
        );
      } else {
        setRating(initialRating || 0);
        setContent("");
        setImages([]);
        setVideos([]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingReview, isOpen, initialRating]);

  // Upload images to Cloudinary and update state with returned url + public_id
  const handleImageFiles = async (files: FileList | null) => {
    if (!files) return;
    const allowedCount = 8;
    const remaining = Math.max(0, allowedCount - images.length);
    const arr = Array.from(files).slice(0, remaining);
    if (arr.length === 0) {
      toast.error(`Only ${allowedCount} photos allowed`);
      return;
    }

    // Basic client-side validation
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    const sizeLimitMB = 5;
    for (const file of arr) {
      if (!allowed.includes(file.type)) {
        toast.error("Invalid file type");
        return;
      }
      if (file.size > sizeLimitMB * 1024 * 1024) {
        toast.error("Max file size is 5MB");
        return;
      }
    }

    // Add temporary previews immediately (no filename caption) with _localId
    const previews: MediaItem[] = arr.map((f) => ({
      url: URL.createObjectURL(f),
      publicId: "",
      public_id: "",
      caption: undefined,
      thumbSafe: undefined,
      _tmp: true,
      _localId: makeLocalId(),
    }));
    setImages((prev) => [...prev, ...previews]);

    // Begin uploads sequentially so we can show progressive progress reliably
    setIsUploading(true);
    setUploadProgress(0);
    let completed = 0;

    try {
      for (let i = 0; i < arr.length; i++) {
        const file = arr[i];
        try {
          const resp: any = await uploadImageToCloudinary(
            file,
            `reviews/${productId}`,
            (p: number) => {
              // p = 0..100 for this file; aggregate into overall progress
              const overall = Math.round(
                (completed / arr.length) * 100 + p / arr.length
              );
              setUploadProgress(Math.min(100, overall));
            }
          );

          // normalize response (no caption set automatically)
          const uploaded: Partial<MediaItem> = {
            url: resp.url || resp.secure_url || resp.secure || "",
            publicId: resp.public_id || resp.publicId || "",
            public_id: resp.public_id || resp.publicId || "",
            caption: undefined,
            thumbSafe:
              resp.thumbSafe || resp.eager?.[0]?.secure_url || undefined,
            _tmp: false,
          };

          // replace the first _tmp preview (in insertion order) with this uploaded item
          setImages((prev) => {
            const copy = [...prev];
            const tmpIndex = copy.findIndex((it) => it._tmp && it._localId);
            if (tmpIndex >= 0) {
              const old = copy[tmpIndex];
              if (old?.url?.startsWith?.("blob:")) {
                try {
                  URL.revokeObjectURL(old.url);
                } catch {}
              }
              copy[tmpIndex] = {
                ...old,
                ...(uploaded as MediaItem),
                _tmp: false,
                // keep existing _localId so key remains stable until publicId arrives
                _localId: old._localId,
              };
            } else {
              // fallback: push with a local id
              copy.push({
                ...(uploaded as MediaItem),
                _localId: makeLocalId(),
                _tmp: false,
              });
            }
            return copy;
          });
        } catch (err: any) {
          console.error("Image upload failed for file", file.name, err);
          // mark as failed placeholder (keeps preview but publicId empty and no caption)
          setImages((prev) => {
            const copy = [...prev];
            const tmpIndex = copy.findIndex((it) => it._tmp && it._localId);
            if (tmpIndex >= 0) {
              copy[tmpIndex] = {
                ...copy[tmpIndex],
                _tmp: false,
                caption: undefined,
                // publicId left empty to indicate upload failure
              };
            } else {
              copy.push({
                url: URL.createObjectURL(file),
                publicId: "",
                public_id: "",
                caption: undefined,
                _tmp: false,
                _localId: makeLocalId(),
              });
            }
            return copy;
          });
          toast.error(`Failed to upload ${file.name}`);
        } finally {
          completed += 1;
          setUploadProgress(
            Math.min(100, Math.round((completed / arr.length) * 100))
          );
        }
      }
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 400);
    }
  };

  // Videos currently use local object URLs — you can wire video upload same way if needed.
  const handleVideoFiles = async (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).slice(0, 2 - videos.length);
    const uploaded = arr.map((f) => ({
      url: URL.createObjectURL(f),
      publicId: "",
      public_id: "",
      caption: undefined,
      _tmp: false,
      _localId: makeLocalId(),
    }));
    setVideos((prev) => [...prev, ...uploaded]);
  };

  const removeImage = (idx: number) =>
    setImages((s) => {
      const copy = [...s];
      const [removed] = copy.splice(idx, 1);
      // revoke blob URL if any
      if (removed?.url?.startsWith?.("blob:")) {
        try {
          URL.revokeObjectURL(removed.url);
        } catch {}
      }
      return copy;
    });

  const removeVideo = (idx: number) =>
    setVideos((s) => {
      const copy = [...s];
      const [removed] = copy.splice(idx, 1);
      if (removed?.url?.startsWith?.("blob:")) {
        try {
          URL.revokeObjectURL(removed.url);
        } catch {}
      }
      return copy;
    });

  // Utility: normalize a media item into backend-friendly shape and ensure publicId is read from either key
  const normalizeImageForPayload = (i: MediaItem) => ({
    url: i.url,
    publicId: i.publicId || i.public_id || "",
    caption: i.caption || undefined,
  });

  const normalizeVideoForPayload = (v: MediaItem) => ({
    url: v.url,
    publicId: v.publicId || v.public_id || "",
    thumbnail: v.caption || undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (isUploading) {
      toast.error("Please wait for uploads to finish before submitting");
      return;
    }

    const isVerified = !!orderId;

    // Clean and normalize media before validating or sending
    const cleanedImages = (images || [])
      .map(normalizeImageForPayload)
      .filter((i) => i.publicId && i.publicId.length > 0);

    const cleanedVideos = (videos || [])
      .map(normalizeVideoForPayload)
      .filter((v) => v.publicId && v.publicId.length > 0);

    // Offline flow requires at least one uploaded media
    if (!isVerified && cleanedImages.length + cleanedVideos.length === 0) {
      toast.error(
        "Offline reviews require at least one uploaded image or video."
      );
      return;
    }

    try {
      const payload: any = {
        productId,
        rating,
        content: content.trim() || undefined,
        images: cleanedImages.length ? cleanedImages : undefined,
        videos: cleanedVideos.length ? cleanedVideos : undefined,
      };

      if (orderId) payload.orderId = orderId;

      if (isEditing && existingReview) {
        await updateReview({
          reviewId: existingReview._id,
          ...payload,
        }).unwrap();
        toast.success("Review updated successfully!");
      } else {
        await createReview(payload).unwrap();
        toast.success("Review posted successfully!");
      }

      handleClose();
      onSuccess?.();
    } catch (err: any) {
      // prefer backend message if available
      const message =
        err?.data?.message || err?.message || "Failed to submit review";
      toast.error(message);
    }
  };

  const handleClose = () => {
    setRating(0);
    setContent("");
    // revoke object urls
    images.forEach((img) => {
      if (img.url?.startsWith?.("blob:")) {
        try {
          URL.revokeObjectURL(img.url);
        } catch {}
      }
    });
    videos.forEach((v) => {
      if (v.url?.startsWith?.("blob:")) {
        try {
          URL.revokeObjectURL(v.url);
        } catch {}
      }
    });
    setImages([]);
    setVideos([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all">
        {/* Header */}
        <header className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? "Edit Your Review" : "Write a Review"}
          </h2>
          <ActionButton
            icon={X}
            variant="secondary"
            size="sm"
            onClick={handleClose}
            className="!p-1"
            aria-label="Close modal"
          />
        </header>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-semibold mb-3 text-gray-900">
              Your Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-3">
              <StarRating
                rating={rating}
                onRatingChange={setRating}
                size="lg"
              />
              {rating > 0 && (
                <span className="text-sm text-gray-600">({rating}/5)</span>
              )}
            </div>
          </div>

          {/* Content */}
          <div>
            <label
              htmlFor="review-content"
              className="block text-sm font-semibold mb-2 text-gray-900"
            >
              Your Review (Optional)
            </label>
            <textarea
              id="review-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your experience..."
              className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
              rows={4}
              maxLength={1000}
            />
            <div className="text-xs text-gray-500 mt-2 flex justify-between">
              <span>Help others by sharing your experience</span>
              <span className={content.length > 800 ? "text-orange-500" : ""}>
                {content.length}/1000
              </span>
            </div>
          </div>

          {/* Media upload (file inputs wired to Cloudinary) */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-900">
              Photos (max 8)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleImageFiles(e.target.files)}
              disabled={isUploading}
            />
            {isUploading && (
              <div className="mt-2 text-sm text-gray-600">
                Uploading... {uploadProgress}%
              </div>
            )}
            <div className="flex gap-2 mt-3 flex-wrap">
              {images.map((img) => (
                // KEY RULE: use Cloudinary public id when available; otherwise use internal local id for temp previews
                <div key={img.publicId || img._localId} className="relative">
                  <img
                    src={img.url}
                    alt={img.caption || "review image"}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const idx = images.findIndex(
                        (i) =>
                          (i.publicId || i._localId) ===
                          (img.publicId || img._localId)
                      );
                      if (idx >= 0) removeImage(idx);
                    }}
                    className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-900">
              Videos (max 2)
            </label>
            <input
              type="file"
              accept="video/*"
              multiple
              onChange={(e) => handleVideoFiles(e.target.files)}
            />
            <div className="flex gap-2 mt-3 flex-wrap">
              {videos.map((v) => (
                <div key={v.publicId || v._localId} className="relative">
                  <video
                    src={v.url}
                    className="w-28 h-20 object-cover rounded"
                    muted
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const idx = videos.findIndex(
                        (x) =>
                          (x.publicId || x._localId) ===
                          (v.publicId || v._localId)
                      );
                      if (idx >= 0) removeVideo(idx);
                    }}
                    className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Note about offline vs verified */}
          <div className="text-sm text-gray-600">
            {orderId ? (
              <div className="text-green-700">
                This review will be posted as a verified purchase.
              </div>
            ) : (
              <div className="text-orange-600">
                Offline reviews require at least one photo or video and will be
                reviewed by admin before appearing publicly.
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <ActionButton
              type="button"
              icon={X}
              label="Cancel"
              variant="secondary"
              onClick={handleClose}
              className="flex-1"
            />
            <ActionButton
              type="submit"
              icon={Send}
              label={isEditing ? "Update Review" : "Post Review"}
              variant="primary"
              disabled={rating === 0 || isUploading}
              isLoading={isLoading || isUploading}
              className="flex-1"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostReviewModal;
