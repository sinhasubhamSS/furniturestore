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

// helper for temporary preview ids
const makeLocalId = () =>
  `local-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;

interface MediaItem {
  url: string;
  publicId?: string;
  public_id?: string;
  caption?: string | undefined;
  thumbSafe?: string | undefined;
  _tmp?: boolean;
  _localId?: string;
}

interface PostReviewModalProps {
  productId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  existingReview?: ReviewDisplayType | null;
  initialRating?: number;
  orderId?: string; // for verified purchases
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
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const [createReview, { isLoading: isCreating }] = useCreateReviewMutation();
  const [updateReview, { isLoading: isUpdating }] = useUpdateReviewMutation();

  const isEditing = !!existingReview;
  const isLoading = isCreating || isUpdating;

  // Load existing review into modal
  useEffect(() => {
    if (isOpen) {
      if (existingReview) {
        setRating(existingReview.rating);
        setContent(existingReview.content || "");

        setImages(
          (existingReview.images || []).map((img: any) => ({
            url: img.url,
            publicId: img.publicId || img.public_id || "",
            caption: img.caption || undefined,
            thumbSafe: img.thumbSafe || undefined,
            _tmp: false,
            _localId: makeLocalId(),
          }))
        );

        setVideos(
          (existingReview.videos || []).map((v: any) => ({
            url: v.url,
            publicId: v.publicId || v.public_id || "",
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
  }, [existingReview, isOpen, initialRating]);

  // === IMAGE UPLOAD HANDLER ===
  const handleImageFiles = async (files: FileList | null) => {
    if (!files) return;

    const allowedCount = 8;
    const remaining = allowedCount - images.length;
    const arr = Array.from(files).slice(0, remaining);

    if (arr.length === 0) {
      toast.error(`Max ${allowedCount} photos allowed`);
      return;
    }

    // file validations
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    const sizeLimitMB = 5;

    for (const f of arr) {
      if (!allowed.includes(f.type)) return toast.error("Invalid file type");
      if (f.size > sizeLimitMB * 1024 * 1024)
        return toast.error("Max size 5MB");
    }

    // temporary previews
    const previews: MediaItem[] = arr.map((f) => ({
      url: URL.createObjectURL(f),
      publicId: "",
      caption: undefined,
      _tmp: true,
      _localId: makeLocalId(),
    }));

    setImages((p) => [...p, ...previews]);

    // upload sequentially for smooth progress
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
              const overall = Math.round(
                (completed / arr.length) * 100 + p / arr.length
              );
              setUploadProgress(Math.min(overall, 100));
            }
          );

          const uploaded: Partial<MediaItem> = {
            url: resp.url || resp.secure_url || "",
            publicId: resp.public_id,
            caption: undefined,
            thumbSafe: resp.thumbSafe,
            _tmp: false,
          };

          // replace preview with real uploaded version
          setImages((prev) => {
            const c = [...prev];
            const idx = c.findIndex((x) => x._tmp);
            if (idx >= 0) {
              c[idx] = {
                ...c[idx],
                ...uploaded,
                _tmp: false,
              };
            }
            return c;
          });
        } catch {
          toast.error("Image upload failed");
        } finally {
          completed++;
        }
      }
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 400);
    }
  };

  // === VIDEO HANDLER (local only for now) ===
  const handleVideoFiles = async (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).slice(0, 2 - videos.length);

    const preview = arr.map((f) => ({
      url: URL.createObjectURL(f),
      publicId: "",
      caption: undefined,
      _tmp: false,
      _localId: makeLocalId(),
    }));

    setVideos((p) => [...p, ...preview]);
  };

  const removeImage = (idx: number) =>
    setImages((p) => {
      const copy = [...p];
      const removed = copy.splice(idx, 1)[0];
      if (removed?.url?.startsWith("blob:")) URL.revokeObjectURL(removed.url);
      return copy;
    });

  const removeVideo = (idx: number) =>
    setVideos((p) => {
      const copy = [...p];
      const removed = copy.splice(idx, 1)[0];
      if (removed?.url?.startsWith("blob:")) URL.revokeObjectURL(removed.url);
      return copy;
    });

  // === SUBMIT ===
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) return toast.error("Please select a rating");
    if (isUploading) return toast.error("Please wait for uploads to finish");

    const cleanedImages = images
      .filter((i) => i.publicId)
      .map((i) => ({
        url: i.url,
        publicId: i.publicId,
        caption: i.caption,
      }));

    const cleanedVideos = videos
      .filter((v) => v.publicId)
      .map((v) => ({
        url: v.url,
        publicId: v.publicId,
        thumbnail: v.caption,
      }));

    if (!orderId && cleanedImages.length + cleanedVideos.length === 0) {
      return toast.error("Offline reviews require a photo/video");
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
        await updateReview({ reviewId: existingReview._id, ...payload });
        toast.success("Review updated!");
      } else {
        await createReview(payload);
        toast.success("Review posted!");
      }

      handleClose();
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to submit review");
    }
  };

  const handleClose = () => {
    setRating(0);
    setContent("");
    images.forEach(
      (i) => i.url.startsWith("blob:") && URL.revokeObjectURL(i.url)
    );
    videos.forEach(
      (v) => v.url.startsWith("blob:") && URL.revokeObjectURL(v.url)
    );
    setImages([]);
    setVideos([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* BACKDROP */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={handleClose}
      />

      {/* MODAL */}
      <div
        className="
        relative bg-white rounded-xl shadow-xl
        w-full max-w-md sm:max-w-lg
        max-h-[90vh] overflow-y-auto   /* FIXED SCROLL */
        transform transition-all scale-[0.97] sm:scale-100
      "
      >
        {/* HEADER */}
        <header className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? "Edit Your Review" : "Write a Review"}
          </h2>
          <ActionButton
            icon={X}
            variant="secondary"
            size="sm"
            onClick={handleClose}
          />
        </header>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* RATING */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-900">
              Rating <span className="text-red-500">*</span>
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

          {/* CONTENT */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-900">
              Review (Optional)
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your experience…"
              className="
                w-full p-4 border border-gray-300 rounded-lg resize-none
                focus:ring-2 focus:ring-pink-500 focus:border-transparent
              "
              rows={4}
              maxLength={1000}
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {content.length}/1000
            </div>
          </div>

          {/* IMAGES */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-900">
              Photos (max 8)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={isUploading}
              onChange={(e) => handleImageFiles(e.target.files)}
            />

            {isUploading && (
              <p className="text-sm text-gray-600 mt-1">
                Uploading… {uploadProgress}%
              </p>
            )}

            <div className="flex gap-2 flex-wrap mt-3">
              {images.map((img, idx) => (
                <div key={img.publicId || img._localId} className="relative">
                  <img
                    src={img.url}
                    className="w-20 h-20 object-cover rounded"
                    alt="Preview"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* VIDEOS */}
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

            <div className="flex gap-2 flex-wrap mt-3">
              {videos.map((v, idx) => (
                <div key={v.publicId || v._localId} className="relative">
                  <video src={v.url} className="w-28 h-20 rounded" muted />
                  <button
                    type="button"
                    onClick={() => removeVideo(idx)}
                    className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* OFFLINE NOTICE */}
          {!orderId && (
            <p className="text-sm text-orange-600">
              Offline reviews require at least one photo or video.
            </p>
          )}

          {/* BUTTONS */}
          <div className="flex gap-3 pt-3">
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
