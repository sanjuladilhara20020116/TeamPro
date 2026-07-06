import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Vite configuration file
export default defineConfig({
  plugins: [
    react(),

    // Enable Tailwind CSS inside Vite
    tailwindcss(),
  ],
});