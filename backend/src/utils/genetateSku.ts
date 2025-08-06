
export const generateSKU = (baseName: string, color?: string, size?: string) => {
  const code = baseName.trim().toUpperCase().slice(0, 3); // e.g., TSH for T-shirt
  const colorCode = color ? color.trim().toUpperCase().slice(0, 3) : "DEF";
  const sizeCode = size ? size.trim().toUpperCase() : "STD";

  const uniquePart = Math.random().toString(36).substring(2, 6).toUpperCase(); // 4-char random
  return `${code}-${sizeCode}-${colorCode}-${uniquePart}`;
};
