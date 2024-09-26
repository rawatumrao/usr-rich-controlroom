import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5180,
  },
  build: {
    assetsInlineLimit: 1000000,
  },
});

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     port: 5180,
//   },
//   build: {
//     assetsInlineLimit: 1000000,
//     rollupOptions: {
//       output: {
//         manualChunks(id) {
//           if (id.includes("node_modules")) {
//             return id
//               .toString()
//               .split("node_modules/")[1]
//               .split("/")[0]
//               .toString();
//           }
//         },
//       },
//     },
//   },
// });
