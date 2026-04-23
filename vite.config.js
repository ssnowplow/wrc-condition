import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [react(), tailwindcss(), cloudflare()],
  server: {
    proxy: {
      // During local dev, rewrite /usgs-proxy/* → USGS API (no Worker needed)
      '/usgs-proxy': {
        target: 'https://waterservices.usgs.gov',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/usgs-proxy/, ''),
      },
      // /nwps-proxy/* → NOAA NWPS API
      '/nwps-proxy': {
        target: 'https://api.water.noaa.gov',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/nwps-proxy/, ''),
      },
      // /nws-proxy/* → NWS weather API
      '/nws-proxy': {
        target: 'https://api.weather.gov',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/nws-proxy/, ''),
      },
    },
  },
})