import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Assets de Tesseract.js (worker/motor WASM) copiados tal cual de
    // node_modules a public/tesseract para servirlos desde el propio
    // sitio (ver runReceiptOcr.ts) — no es código nuestro, no se lintea.
    "public/tesseract/**",
  ]),
]);

export default eslintConfig;
