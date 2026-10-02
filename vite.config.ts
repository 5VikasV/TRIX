import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: "firebase-auth", test: /node_modules\/@firebase\/auth/ },
            { name: "firebase-firestore", test: /node_modules\/@firebase\/firestore/ },
            { name: "firebase-core", test: /node_modules\/(?:@firebase|firebase)\// },
          ],
        },
      },
    },
  },
});
