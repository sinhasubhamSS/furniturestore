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
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>(defaultUrls);

  // Cleanup previews on unmount
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

    if (files.length + uploadedImages.length > maxFiles) {
      toast.error(`Only ${maxFiles} image(s) allowed in total`);
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

    const previewUrls = Array.from(files).map((file) => URL.createObjectURL(file));
    setPreviews(previewUrls);
    await uploadImages(files);
  };

  const uploadImages = async (files: FileList | File[]) => {
    setUploading(true);
    setProgress(0);
    const newUploaded: UploadedImage[] = [];

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
        newUploaded.push({ url, public_id });
      } catch {
        toast.error(`Failed to upload ${files[i].name}`);
      }
    }

    setUploading(false);
    setProgress(0);

    const updated = [...uploadedImages, ...newUploaded];
    setUploadedImages(updated);
    setPreviews([]);
    onUpload(updated);

    if (newUploaded.length === files.length) {
      toast.success("All images uploaded!");
    } else {
      toast.error("Some images failed to upload");
    }
  };

  const removeImage = (index: number) => {
    const updated = [...uploadedImages];
    updated.splice(index, 1);
    setUploadedImages(updated);
    onUpload(updated);
  };

  return (
    <div className="space-y-4">
      <div
        className="relative border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-md p-6 flex flex-col items-center justify-center cursor-pointer text-gray-500 hover:text-blue-500 transition"
        onClick={() => inputRef.current?.click()}
      >
        <FiUpload className="text-3xl mb-2" />
        <p className="text-sm font-medium">Click to upload or drag images here</p>
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
            <div key={i} className="relative group">
              <img
                src={img.url}
                className="w-full h-28 object-cover rounded shadow border"
                alt={`Uploaded ${i}`}
              />
              <button
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 bg-black bg-opacity-60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
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
