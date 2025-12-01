"use client";

import { useRef, useState, useEffect } from "react";
import { FiUpload, FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import { uploadImageToCloudinary } from "../../../utils/uploadToCloudinary";

export interface UploadedImage {
  url: string; // original full-quality URL (secure_url)
  public_id: string;
  thumbSafe?: string; // low-quality full-image (no crop) for lists
  isPrimary?: boolean;
  _origFileName?: string; // internal for failed placeholders
}

interface ImageUploaderProps {
  folder?: string;
  maxFiles?: number;
  onUpload: (images: UploadedImage[]) => void;
  defaultUrls?: UploadedImage[]; // already normalized objects expected
  onUploadStart?: () => void; // called when an upload batch starts
  onUploadEnd?: () => void; // called when an upload batch finishes
}

const makeKey = (img: UploadedImage, idx: number) =>
  img.public_id
    ? `${img.public_id}-${idx}`
    : `${img._origFileName || "img"}-${idx}-${Date.now()}`;

export default function ImageUploader({
  folder = "default",
  maxFiles = 1,
  onUpload,
  defaultUrls = [],
  onUploadStart,
  onUploadEnd,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previewsMap, setPreviewsMap] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>(
    defaultUrls || []
  );

  useEffect(() => {
    if (defaultUrls && defaultUrls.length) setUploadedImages(defaultUrls);
  }, [defaultUrls]);

  useEffect(() => {
    return () => {
      previewsMap.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch {}
      });
    };
  }, [previewsMap]);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (uploadedImages.length + files.length > maxFiles) {
      toast.error(`Only ${maxFiles} image(s) allowed in total`);
      return;
    }

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    const sizeLimitMB = 5;
    for (const file of Array.from(files)) {
      if (!allowed.includes(file.type)) {
        toast.error("Invalid file type");
        return;
      }
      if (file.size > sizeLimitMB * 1024 * 1024) {
        toast.error("Max file size is 5MB");
        return;
      }
    }

    const batchPreviews = Array.from(files).map((file) =>
      URL.createObjectURL(file)
    );
    setPreviewsMap(batchPreviews);

    onUploadStart?.();
    await uploadImages(files, batchPreviews);
    onUploadEnd?.();

    if (inputRef.current) inputRef.current.value = "";
  };

  const uploadImages = async (
    files: FileList | File[],
    batchPreviews: string[]
  ) => {
    setUploading(true);
    setProgress(0);

    const fileArray = Array.from(files);
    const total = fileArray.length;
    const newUploaded: UploadedImage[] = [];
    let completed = 0;

    for (let i = 0; i < total; i++) {
      const file = fileArray[i];
      const previewForThis = batchPreviews[i];

      try {
        const perFileOnProgress = (p: number) => {
          const overall = (completed / total) * 100 + p / total;
          setProgress(Math.min(100, Math.round(overall)));
        };

        const resp: any = await uploadImageToCloudinary(
          file,
          folder,
          perFileOnProgress
        );

        const normalized: UploadedImage = {
          url: resp.url || resp.secure_url || resp.secure || "",
          public_id: resp.public_id || resp.publicId || "",
          thumbSafe: resp.thumbSafe || resp.eager?.[0]?.secure_url || undefined,
          isPrimary: false,
        };

        if (!normalized.url || !normalized.public_id) {
          if (previewForThis) URL.revokeObjectURL(previewForThis);
          throw new Error("Invalid upload response");
        }

        newUploaded.push(normalized);
        completed += 1;
        setProgress(Math.min(100, Math.round((completed / total) * 100)));
      } catch (err: any) {
        console.error("uploadImages error:", err);
        // push a failed placeholder using preview so user sees it and can remove
        const failed: UploadedImage = {
          url: batchPreviews[i] || "",
          public_id: "",
          _origFileName: fileArray[i].name,
        };
        newUploaded.push(failed);
        completed += 1;
        setProgress(Math.min(100, Math.round((completed / total) * 100)));
        toast.error(`Failed to upload ${fileArray[i].name}`);
      }
    }

    setUploading(false);
    setTimeout(() => setProgress(0), 300);

    const updated = [...uploadedImages, ...newUploaded].slice(0, maxFiles);
    setUploadedImages(updated);

    // revoke previews not used by failed placeholders
    batchPreviews.forEach((url) => {
      const usedByFailed = updated.some(
        (u) => u.url === url && (!u.public_id || u.public_id.length === 0)
      );
      if (!usedByFailed) {
        try {
          URL.revokeObjectURL(url);
        } catch {}
      }
    });

    setPreviewsMap([]);
    onUpload(updated);

    if (newUploaded.every((n) => n.public_id && n.public_id.length > 0)) {
      toast.success("All images uploaded!");
    } else if (newUploaded.some((n) => n.public_id && n.public_id.length > 0)) {
      toast.success("Some images uploaded");
    } else {
      toast.error("No images uploaded");
    }
  };

  const removeImage = (index: number) => {
    const updated = [...uploadedImages];
    const removed = updated.splice(index, 1)[0];
    if (removed && removed.url && removed.url.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(removed.url);
      } catch {}
    }
    setUploadedImages(updated);
    onUpload(updated);
  };

  const getPreviewSrc = (idx: number, img: UploadedImage) => {
    if (img.url && img.url.startsWith("blob:")) return img.url;
    if (previewsMap[idx]) return previewsMap[idx];
    return img.thumbSafe || img.url || "/placeholder.jpg";
  };

  return (
    <div className="space-y-4">
      <div
        role="button"
        tabIndex={0}
        className="relative border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-md p-6 flex flex-col items-center justify-center cursor-pointer text-gray-500 hover:text-blue-500 transition"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter") inputRef.current?.click();
        }}
      >
        <FiUpload className="text-3xl mb-2" />
        <p className="text-sm font-medium">
          Click to upload or drag images here
        </p>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept="image/jpeg, image/png, image/webp, image/avif"
          multiple={maxFiles > 1}
          onChange={handleChange}
        />
      </div>

      {uploading && (
        <div className="w-full bg-gray-200 h-2 rounded">
          <div
            className="bg-blue-500 h-2 rounded transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {uploadedImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {uploadedImages.map((img, i) => (
            <div key={makeKey(img, i)} className="relative group">
              <img
                src={getPreviewSrc(i, img)}
                className="w-full h-28 object-cover rounded shadow border"
                alt={img._origFileName || `Uploaded ${i}`}
              />
              <button
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 bg-black bg-opacity-60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                aria-label="Remove image"
              >
                <FiX size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
