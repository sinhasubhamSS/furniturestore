export const uploadImageToCloudinary = async (
  file: File,
  folder: string = "default",
  onProgress?: (percent: number) => void
): Promise<{ url: string; public_id: string }> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();

    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
    );
    formData.append("folder", folder);

    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`
    );

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent);
      }
    });

    xhr.onload = () => {
      const res = JSON.parse(xhr.responseText);
      if (res.secure_url && res.public_id) {
        resolve({
          url: res.secure_url,
          public_id: res.public_id,
        });
      } else {
        reject("Upload failed");
      }
    };

    xhr.onerror = () => reject("Upload error");
    xhr.send(formData);
  });
};
