export const generateSKU = (baseName: string, color?: string, size?: string) => {
  const sanitize = (str: string) => str.replace(/[^a-zA-Z0-9]/g, "");

  const code = sanitize(baseName).toUpperCase().slice(0, 3) || "NON";
  const colorCode = color ? sanitize(color).toUpperCase().slice(0, 3) : "DEF";
  const sizeCode = size ? sanitize(size).toUpperCase() : "STD";

  const uniquePart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${code}-${sizeCode}-${colorCode}-${uniquePart}`;
};
