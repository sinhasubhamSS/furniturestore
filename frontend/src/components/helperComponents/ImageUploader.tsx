"use client";

import { useRef, useState, useEffect } from "react";
import { FiUpload, FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import { uploadImageToCloudinary } from "../../../utils/uploadToCloudinary";

/* normalized image shape - matches backend model expectations */
export interface UploadedImage {
  url: string;
  public_id: string;
  thumbSafe?: string;
  thumbSmart?: string;
  blurDataURL?: string;
  isPrimary?: boolean;
}

interface ImageUploaderProps {
  folder?: string;
  maxFiles?: number;
  onUpload: (images: UploadedImage[]) => void;
  defaultUrls?: UploadedImage[]; // already normalized objects expected
}

export default function ImageUploader({
  folder = "default",
  maxFiles = 1,
  onUpload,
  defaultUrls = [],
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0); // 0..100 overall
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>(
    defaultUrls || []
  );

  // initialize previews for defaultUrls (so thumbnails show if page loads with defaults)
  useEffect(() => {
    if (defaultUrls && defaultUrls.length) {
      setUploadedImages(defaultUrls);
    }
  }, [defaultUrls]);

  // cleanup object URLs created for previews
  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

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

    // create previews for UX
    const previewUrls = Array.from(files).map((file) =>
      URL.createObjectURL(file)
    );
    setPreviews(previewUrls);

    await uploadImages(files);
    // reset input so same file can be selected again
    if (inputRef.current) inputRef.current.value = "";
  };

  /**
   * uploadImages
   * - uploads files sequentially (safer for rate limits) but reports overall progress correctly
   * - expects uploadImageToCloudinary(file, folder, onProgress) to return an object:
   *   { url, public_id, thumbSafe?, thumbSmart?, blurDataURL? }
   */
  const uploadImages = async (files: FileList | File[]) => {
    setUploading(true);
    setProgress(0);

    const fileArray = Array.from(files);
    const total = fileArray.length;
    const newUploaded: UploadedImage[] = [];
    let completed = 0;

    for (let i = 0; i < total; i++) {
      const file = fileArray[i];
      try {
        // per-file progress updated into overall progress
        const perFileOnProgress = (p: number) => {
          // p: 0..100 for current file
          // overall = (completed / total)*100 + (p/total)
          const overall = (completed / total) * 100 + p / total;
          setProgress(Math.min(100, Math.round(overall)));
        };

        const resp: any = await uploadImageToCloudinary(
          file,
          folder,
          perFileOnProgress
        );

        // normalize response into UploadedImage
        const normalized: UploadedImage = {
          url: resp.secure_url || resp.url || "",
          public_id:
            resp.public_id ||
            resp.publicId ||
            extractPublicId(resp.secure_url || resp.url || "") ||
            "",
          thumbSafe:
            resp.eager?.[0]?.secure_url ||
            resp.thumbSafe ||
            resp.transformUrls?.thumbSafe,
          thumbSmart:
            resp.eager?.[1]?.secure_url ||
            resp.thumbSmart ||
            resp.transformUrls?.thumbSmart,
          blurDataURL: resp.blurDataURL || resp.tinyBase64,
          isPrimary: false,
        };

        // minimal validation
        if (!normalized.url || !normalized.public_id) {
          throw new Error("Invalid upload response");
        }

        newUploaded.push(normalized);
        completed += 1;
        // update progress to reflect completed file
        setProgress(Math.min(100, Math.round((completed / total) * 100)));
      } catch (err: any) {
        console.error("uploadImages error:", err);
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    // finalize
    setUploading(false);
    setTimeout(() => setProgress(0), 300);

    const updated = [...uploadedImages, ...newUploaded].slice(0, maxFiles);
    setUploadedImages(updated);
    setPreviews([]);
    onUpload(updated);

    if (newUploaded.length === total) {
      toast.success("All images uploaded!");
    } else if (newUploaded.length > 0) {
      toast.success("Some images uploaded");
    } else {
      toast.error("No images uploaded");
    }
  };

  const removeImage = (index: number) => {
    const updated = [...uploadedImages];
    updated.splice(index, 1);
    setUploadedImages(updated);
    onUpload(updated);
  };

  // helper: best preview URL (prefer local preview, else stored url)
  const getPreviewSrc = (idx: number, img: UploadedImage) => {
    // if previews present (fresh upload) show them in order
    if (previews[idx]) return previews[idx];
    return img.url || "/placeholder.jpg";
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
            <div key={img.public_id + "-" + i} className="relative group">
              <img
                src={getPreviewSrc(i, img)}
                className="w-full h-28 object-cover rounded shadow border"
                alt={`Uploaded ${i}`}
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

/* ---------- small helper to extract cloudinary public id from URL if needed ---------- */
function extractPublicId(url: string) {
  try {
    if (!url) return "";
    // cloudinary urls like: https://res.cloudinary.com/<cloud>/image/upload/v1234/folder/name.ext
    const parts = url.split("/upload/");
    if (parts.length < 2) return "";
    const after = parts[1]; // v1234/folder/name.ext
    // remove version and extension
    const segments = after.split("/");
    // remove version if present (starts with v)
    if (segments[0].startsWith("v")) segments.shift();
    const publicWithExt = segments.join("/"); // folder/name.ext
    const idx = publicWithExt.lastIndexOf(".");
    return idx > 0 ? publicWithExt.slice(0, idx) : publicWithExt;
  } catch {
    return "";
  }
}
