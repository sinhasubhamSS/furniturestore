const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "warn", // Warn instead of error
      "@typescript-eslint/no-explicit-any": "off",
      "react/no-unescaped-entities": "warn",
      "@next/next/no-html-link-for-pages": "error",
      "@next/next/no-img-element": "warn",
    },
  },
];
export default eslintConfig;






// import { dirname } from "path";
// import { fileURLToPath } from "url";
// import { FlatCompat } from "@eslint/eslintrc";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const compat = new FlatCompat({
//   baseDirectory: __dirname,
// });

// const eslintConfig = [
//   ...compat.extends("next/core-web-vitals", "next/typescript"),
// ];

// export default eslintConfig;
