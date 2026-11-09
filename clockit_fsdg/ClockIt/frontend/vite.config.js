import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Lets the dev server be opened through GitHub Codespaces' forwarded
    // URLs (https://<name>-5173.app.github.dev). Only affects `npm run dev`.
    allowedHosts: ['.app.github.dev'],
  },
})
