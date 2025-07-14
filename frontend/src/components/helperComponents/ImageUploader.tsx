"use client";

import { useRef, useState, useEffect } from "react";
import { FiUpload, FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import { uploadImageToCloudinary } from "../../../utils/uploadToCloudinary";

interface UploadedImage {
  url: string;
  public_id: string;
}

interface ImageUploaderProps {
  folder?: string;
  maxFiles?: number;
  onUpload: (images: UploadedImage[]) => void;
  defaultUrls?: UploadedImage[];
}

export default function ImageUploader({
  folder = "default",
  maxFiles = 1,
  onUpload,
  defaultUrls = [],
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // 🔁 Clean up previews on update/unmount
  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    const sizeLimitMB = 5;

    if (files.length > maxFiles) {
      toast.error(`Only ${maxFiles} image(s) allowed`);
      return;
    }

    for (const file of files) {
      if (!allowed.includes(file.type)) {
        toast.error("Invalid file type");
        return;
      }
      if (file.size > sizeLimitMB * 1024 * 1024) {
        toast.error("Max file size is 5MB");
        return;
      }
    }

    // 🧹 Clear previous previews
    previews.forEach((url) => URL.revokeObjectURL(url));
    setPreviews(Array.from(files).map((file) => URL.createObjectURL(file)));

    await uploadImages(files);
  };

  const uploadImages = async (files: FileList | File[]) => {
    setUploading(true);
    setProgress(0);
    const uploadedImages: UploadedImage[] = [];

    for (let i = 0; i < files.length; i++) {
      try {
        const file = files[i];
        const { url, public_id } = await uploadImageToCloudinary(
          file,
          folder,
          (p) => {
            const current = (i / files.length) * 100;
            setProgress(current + p / files.length);
          }
        );

        uploadedImages.push({ url, public_id });
      } catch (err) {
        toast.error(`Failed to upload ${files[i].name}`);
      }
    }

    setUploading(false);
    setProgress(0);

    if (uploadedImages.length === files.length) {
      toast.success("All images uploaded!");
      onUpload(uploadedImages);
    } else if (uploadedImages.length > 0) {
      toast.error("Some images failed to upload");
      onUpload(uploadedImages); // Optional: You can skip this if partial uploads aren't allowed
    }
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    const updated = [...previews];
    updated.splice(index, 1);
    setPreviews(updated);
  };

  return (
    <div className="space-y-3">
      <label className="cursor-pointer flex items-center gap-2 text-sm font-medium text-blue-600">
        <FiUpload className="w-5 h-5" />
        Upload Image
        <input
          type="file"
          ref={inputRef}
          onChange={handleChange}
          className="hidden"
          accept="image/jpeg, image/png, image/webp, image/avif"
          multiple={maxFiles > 1}
        />
      </label>

      {uploading && (
        <div className="w-full bg-gray-200 h-2 rounded">
          <div
            className="bg-blue-500 h-2 rounded transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {previews.map((src, i) => (
          <div key={i} className="relative group">
            <img
              src={src}
              className="w-full h-28 object-cover rounded shadow"
              alt="preview"
            />
            <button
              onClick={() => removeImage(i)}
              className="absolute top-1 right-1 bg-black bg-opacity-50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
            >
              <FiX size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
