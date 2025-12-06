// function injectTransform(url: string, transform: string): string {
//   if (!url.includes("/upload/")) return url;

//   const [prefix, rest] = url.split("/upload/");
//   const before = prefix + "/upload/";
//   const parts = rest.split("/");

//   const first = parts[0];
//   const isTransform =
//     /^[a-z0-9_,\-]+$/i.test(first) && (first.includes("_") || first.includes(","));

//   // remove old transform if present
//   if (isTransform) parts.shift();

//   const newRest = parts.join("/");
//   return `${before}${transform}/${newRest}`;
// }

// export const uploadImageToCloudinary = async (
//   file: File,
//   folder: string = "default",
//   onProgress?: (percent: number) => void
// ): Promise<{ url: string; public_id: string; thumbSafe?: string }> => {
//   return new Promise((resolve, reject) => {
//     const xhr = new XMLHttpRequest();
//     const formData = new FormData();

//     formData.append("file", file);
//     formData.append(
//       "upload_preset",
//       process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
//     );
//     formData.append("folder", folder);

//     xhr.open(
//       "POST",
//       `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`
//     );

//     xhr.upload.addEventListener("progress", (e) => {
//       if (e.lengthComputable && onProgress) {
//         const percent = Math.round((e.loaded / e.total) * 100);
//         onProgress(percent);
//       }
//     });

//     xhr.onload = () => {
//       let res: any = {};
//       try {
//         res = xhr.responseText ? JSON.parse(xhr.responseText) : {};
//       } catch {
//         return reject(new Error("Invalid JSON from Cloudinary"));
//       }

//       const secure = res.secure_url || res.url || "";
//       const pub = res.public_id || res.publicId || "";

//       if (!secure || !pub) {
//         return reject(new Error("Upload failed: missing url/public_id"));
//       }

//       // safe low-quality full-image thumbnail
//       let thumbSafe = "";
//       try {
//         thumbSafe = injectTransform(secure, "f_auto,q_auto,w_600");
//       } catch {
//         thumbSafe = secure;
//       }

//       resolve({
//         url: secure, // <-- KEEP simple url
//         public_id: pub,
//         thumbSafe,
//       });
//     };

//     xhr.onerror = () => reject(new Error("Upload network error"));
//     xhr.send(formData);
//   });
// };

function injectTransform(url: string, transform: string): string {
  if (!url.includes("/upload/")) return url;

  const [prefix, rest] = url.split("/upload/");
  const before = prefix + "/upload/";
  const parts = rest.split("/");

  const first = parts[0];
  const isTransform =
    /^[a-z0-9_,\-]+$/i.test(first) &&
    (first.includes("_") || first.includes(","));

  // remove old transform if present
  if (isTransform) parts.shift();

  const newRest = parts.join("/");
  return `${before}${transform}/${newRest}`;
}

export const uploadImageToCloudinary = async (
  file: File,
  folder: string = "default",
  onProgress?: (percent: number) => void
): Promise<{ url: string; public_id: string; thumbSafe?: string }> => {
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
      let res: any = {};
      try {
        res = xhr.responseText ? JSON.parse(xhr.responseText) : {};
      } catch {
        return reject(new Error("Invalid JSON from Cloudinary"));
      }

      const secure = res.secure_url || res.url || "";
      const pub = res.public_id || res.publicId || "";

      if (!secure || !pub) {
        return reject(new Error("Upload failed: missing url/public_id"));
      }

      // FINAL THUMB (NO CROP, NO WIDTH/HEIGHT, ONLY QUALITY REDUCE)
      let thumbSafe = "";
      try {
        // f_auto => modern format (AVIF / WebP)
        // q_auto:eco => highest compression for listing page
        thumbSafe = injectTransform(secure, "f_auto,q_auto:eco");
      } catch {
        thumbSafe = secure;
      }

      resolve({
        url: secure,
        public_id: pub,
        thumbSafe,
      });
    };

    xhr.onerror = () => reject(new Error("Upload network error"));
    xhr.send(formData);
  });
};
